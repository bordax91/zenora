import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import stripe from '@/lib/stripe'
import { sendClientConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'
import { sendCoachConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'

const secretMain = process.env.STRIPE_WEBHOOK_SECRET_MAIN
const secretConnected = process.env.STRIPE_WEBHOOK_SECRET_CONNECTED

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  const rawBody = await req.text()
  let event = null

  // Essayer avec les deux secrets (connecté ou principal)
  const secrets = [
    { name: 'CONNECTED', key: secretConnected },
    { name: 'MAIN', key: secretMain }
  ]

  for (const { name, key } of secrets) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, key)
      console.log(`✅ Webhook reçu (${name}) :`, event.type)
      break
    } catch (err) {
      console.warn(`❌ Signature invalide pour secret ${name}`)
    }
  }

  if (!event) {
    return NextResponse.json({ error: 'Signature invalide pour tous les secrets' }, { status: 400 })
  }

  const session = event.data.object
  const metadata = session.metadata || {}

  // 🎯 CAS 1 : Paiement de session client (compte connecté)
  if (
    event.type === 'checkout.session.completed' &&
    metadata.client_id && metadata.package_id && metadata.availability_id
  ) {
    const { client_id: clientId, package_id: packageId, availability_id: availabilityId } = metadata

    // 🔎 Vérifier que le client existe
    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      console.error('❌ Client introuvable :', clientError)
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    // 🔎 Vérifier que le créneau est valide et dispo
    const { data: availability, error: availabilityError } = await supabase
      .from('availabilities')
      .select('date, coach_id, is_booked')
      .eq('id', availabilityId)
      .single()

    if (availabilityError || !availability) {
      console.error('❌ Créneau non trouvé :', availabilityError)
      return NextResponse.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }

    if (availability.is_booked) {
      console.warn('⚠️ Créneau déjà réservé')
      return NextResponse.json({ message: 'Créneau déjà réservé' }, { status: 200 })
    }

    const { coach_id, date } = availability

    // 🔎 Vérifier que le coach existe
    const { data: coach, error: coachError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', coach_id)
      .single()

    if (coachError || !coach) {
      console.error('❌ Coach introuvable :', coachError)
      return NextResponse.json({ error: 'Coach introuvable' }, { status: 404 })
    }

    // 🔎 Vérifier que le package existe
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('title')
      .eq('id', packageId)
      .single()

    if (packageError || !packageData) {
      console.error('❌ Package introuvable :', packageError)
      return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 })
    }

    // ✅ Insérer la session
    const { error: insertError } = await supabase.from('sessions').insert({
      coach_id,
      client_id: clientId,
      package_id: packageId,
      date,
      availability_id: availabilityId,
      statut: 'réservé'
    })

    if (insertError) {
      console.error('❌ Erreur insertion session :', insertError)
      return NextResponse.json({ error: 'Impossible de créer la session' }, { status: 500 })
    }

    // ✅ Marquer le créneau comme réservé
    await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', availabilityId)

    // ✅ Envoyer les emails
    try {
      await sendClientConfirmationEmail({
        to: client.email,
        clientName: client.name,
        coachName: coach.name,
        date,
        time: new Date(date).toLocaleTimeString(),
        packageTitle: packageData.title
      })

      await sendCoachConfirmationEmail({
        to: coach.email,
        coachName: coach.name,
        clientName: client.name,
        date,
        time: new Date(date).toLocaleTimeString(),
        packageTitle: packageData.title
      })
    } catch (emailErr) {
      console.error('❌ Erreur envoi email confirmation :', emailErr)
    }

    console.log('✅ Session créée + créneau réservé + emails envoyés')
  }

  // 🎯 CAS 2 : Paiement abonnement coach (compte principal)
  if (
    event.type === 'checkout.session.completed' &&
    session.mode === 'subscription'
  ) {
    const stripeCustomerId = session.customer
    const coachId = metadata.coach_id || metadata.user_id || null
    const customerEmail = session.customer_email || null

    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    const priceId = subscription?.items?.data?.[0]?.price?.id || null

    let subscriptionType = 'inconnu'
    if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) {
      subscriptionType = 'mensuel'
    } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
      subscriptionType = 'annuel'
    }

    let updateError

    if (coachId) {
      ({ error: updateError } = await supabase
        .from('users')
        .update({
          is_subscribed: true,
          stripe_customer_id: stripeCustomerId,
          subscription_started_at: new Date().toISOString(),
          subscription_type: subscriptionType
        })
        .eq('id', coachId))
    } else if (customerEmail) {
      ({ error: updateError } = await supabase
        .from('users')
        .update({
          is_subscribed: true,
          stripe_customer_id: stripeCustomerId,
          subscription_started_at: new Date().toISOString(),
          subscription_type: subscriptionType
        })
        .eq('email', customerEmail))
    }

    if (updateError) {
      console.error('❌ Erreur MAJ abonnement coach :', updateError)
    } else {
      console.log(`✅ Abonnement ${subscriptionType} activé pour coach via ${coachId || customerEmail}`)
    }
  }

  // 🎯 CAS 3 : Désabonnement
  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer

    const { error: unsubError } = await supabase
      .from('users')
      .update({ is_subscribed: false })
      .eq('stripe_customer_id', customerId)

    if (unsubError) {
      console.error('❌ Erreur désabonnement coach :', unsubError)
    } else {
      console.log(`🚫 Coach désabonné (customer ${customerId})`)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
