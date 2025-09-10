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
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const session = event.data.object
  const metadata = session.metadata || {}

  // === CAS 1 : Paiement de session client ===
  if (
    event.type === 'checkout.session.completed' &&
    metadata.client_id && metadata.package_id && metadata.availability_id
  ) {
    const { client_id: clientId, package_id: packageId, availability_id: availabilityId } = metadata

    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', clientId)
      .single()

    const { data: availability, error: availabilityError } = await supabase
      .from('availabilities')
      .select('date, coach_id, is_booked')
      .eq('id', availabilityId)
      .single()

    if (availability?.is_booked || clientError || availabilityError || !availability) {
      return NextResponse.json({ error: 'Erreur données client ou créneau' }, { status: 404 })
    }

    const { coach_id, date } = availability

    const { data: coach, error: coachError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', coach_id)
      .single()

    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('title')
      .eq('id', packageId)
      .single()

    if (coachError || packageError || !coach || !packageData) {
      return NextResponse.json({ error: 'Erreur données coach ou offre' }, { status: 404 })
    }

    const { error: insertError } = await supabase.from('sessions').insert({
      coach_id,
      client_id: clientId,
      package_id: packageId,
      date,
      availability_id: availabilityId,
      statut: 'réservé'
    })

    if (!insertError) {
      await supabase.from('availabilities').update({ is_booked: true }).eq('id', availabilityId)

      try {
        await sendClientConfirmationEmail({
          to: client.email,
          clientName: client.name,
          coachName: coach.name,
          date,
          time: new Date(date).toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' }),
          packageTitle: packageData.title
        })

        await sendCoachConfirmationEmail({
          to: coach.email,
          coachName: coach.name,
          clientName: client.name,
          date,
          time: new Date(date).toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' }),
          packageTitle: packageData.title
        })
      } catch (emailErr) {
        console.error('❌ Erreur envoi email confirmation :', emailErr)
      }

      console.log('✅ Session créée + créneau réservé + emails envoyés')
    } else {
      console.error('❌ Erreur insertion session :', insertError)
    }
  }

  // === CAS 2 : Paiement abonnement (compte principal) ===
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
      console.log(`✅ Abonnement ${subscriptionType} activé via ${coachId || customerEmail}`)
    }
  }

  // === CAS 3 : Désabonnement (customer.subscription.deleted) ===
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const customerId = subscription.customer

    let customerEmail = null
    try {
      const customer = await stripe.customers.retrieve(customerId)
      customerEmail = customer?.email || null
    } catch (err) {
      console.warn(`⚠️ Impossible de récupérer l'email Stripe pour customer ${customerId}`)
    }

    const { error: unsubError, count } = await supabase
      .from('users')
      .update({ is_subscribed: false })
      .or(`stripe_customer_id.eq.${customerId},email.eq.${customerEmail}`)
      .select('*', { count: 'exact' })

    if (unsubError) {
      console.error('❌ Erreur désabonnement coach :', unsubError)
    } else if (count === 0) {
      console.warn(`⚠️ Aucun utilisateur trouvé à désabonner (customerId: ${customerId}, email: ${customerEmail})`)
    } else {
      console.log(`🚫 Coach désabonné (customerId: ${customerId}, email: ${customerEmail})`)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
