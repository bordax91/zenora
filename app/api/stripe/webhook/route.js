import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import stripe from '@/lib/stripe'
import { sendClientConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'
import { sendCoachConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

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
  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
    console.log('✅ Webhook reçu :', event.type)
  } catch (err) {
    console.error('❌ Erreur de vérification Stripe :', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const session = event.data.object
  const metadata = session.metadata || {}

  // 🎯 CAS 1 : Paiement RDV client
  if (
    event.type === 'checkout.session.completed' &&
    metadata.client_id && metadata.package_id && metadata.availability_id
  ) {
    const { client_id: clientId, package_id: packageId, availability_id: availabilityId } = metadata

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
      console.warn('⚠️ Créneau déjà réservé.')
      return NextResponse.json({ message: 'Déjà réservé' }, { status: 200 })
    }

    const { coach_id, date } = availability

    const { data: coach } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', coach_id)
      .single()

    const { data: client } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', clientId)
      .single()

    const { data: packageData } = await supabase
      .from('packages')
      .select('title')
      .eq('id', packageId)
      .single()

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

    await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', availabilityId)

    try {
      if (client?.email && coach?.email) {
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
      }
    } catch (emailErr) {
      console.error('❌ Erreur envoi email confirmation :', emailErr)
    }

    console.log('✅ Session créée + créneau réservé + emails envoyés')
  }

  // 🎯 CAS 2 : checkout.session.completed pour abonnement
  if (
    event.type === 'checkout.session.completed' &&
    session.mode === 'subscription'
  ) {
    const stripeCustomerId = session.customer
    const coachId = metadata.coach_id || metadata.user_id || null
    const customerEmail = session.customer_email || null

    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    const priceId = subscription?.items?.data?.[0]?.price?.id || null
    const subscriptionId = subscription?.id

    let subscriptionType = 'inconnu'
    if (
      priceId === process.env.STRIPE_PRICE_ID_MONTHLY ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST_MONTHLY
    ) {
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
          stripe_subscription_id: subscriptionId,
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
          stripe_subscription_id: subscriptionId,
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

  // 🎯 CAS 2B : customer.subscription.created
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object
    const customerId = subscription.customer
    const subscriptionId = subscription.id
    const priceId = subscription.items?.data?.[0]?.price?.id || null

    let subscriptionType = 'inconnu'
    if (
      priceId === process.env.STRIPE_PRICE_ID_MONTHLY ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST_MONTHLY
    ) {
      subscriptionType = 'mensuel'
    } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
      subscriptionType = 'annuel'
    }

    const customer = await stripe.customers.retrieve(customerId)
    const customerEmail = customer?.email

    if (customerEmail) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_subscribed: true,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_started_at: new Date().toISOString(),
          subscription_type: subscriptionType
        })
        .eq('email', customerEmail)

      if (updateError) {
        console.error('❌ Erreur MAJ depuis customer.subscription.created :', updateError)
      } else {
        console.log(`✅ Abonnement ${subscriptionType} mis à jour via event "customer.subscription.created"`)
      }
    } else {
      console.warn('⚠️ Email non trouvé pour le customer ID :', customerId)
    }
  }

  // 🎯 CAS 3 : Désabonnement
  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer

    const { error: unsubError } = await supabase
      .from('users')
      .update({
        is_subscribed: false,
        stripe_subscription_id: null
      })
      .eq('stripe_customer_id', customerId)

    if (unsubError) {
      console.error('❌ Erreur désabonnement coach :', unsubError)
    } else {
      console.log(`🚫 Coach désabonné (customer ${customerId})`)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
