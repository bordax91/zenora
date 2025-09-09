import { buffer } from 'micro'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import stripe from '@/lib/stripe'
import { sendClientConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'
import { sendCoachConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'

export const config = {
  api: {
    bodyParser: false,
  },
}

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

  let rawBody
  try {
    rawBody = await buffer(req)
  } catch (err) {
    console.error('❌ Erreur lecture rawBody :', err.message)
    return NextResponse.json({ error: 'Erreur lecture body' }, { status: 500 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
    console.log('✅ Webhook reçu :', event.type)
  } catch (err) {
    console.error('❌ Erreur de vérification Stripe :', err.message)
    return NextResponse.json({ error: 'Signature Stripe invalide' }, { status: 400 })
  }

  const session = event.data.object
  const metadata = session.metadata || {}

  // === CAS 1 : Paiement RDV ===
  if (
    event.type === 'checkout.session.completed' &&
    metadata.client_id && metadata.package_id && metadata.availability_id
  ) {
    const { client_id, package_id, availability_id } = metadata

    const { data: availability, error: availabilityError } = await supabase
      .from('availabilities')
      .select('date, coach_id, is_booked')
      .eq('id', availability_id)
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

    const { data: coach } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', coach_id)
      .single()

    const { data: client } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', client_id)
      .single()

    const { data: packageData } = await supabase
      .from('packages')
      .select('title')
      .eq('id', package_id)
      .single()

    const { error: insertError } = await supabase
      .from('sessions')
      .insert({
        coach_id,
        client_id,
        package_id,
        date,
        availability_id,
        statut: 'réservé',
      })

    if (insertError) {
      console.error('❌ Erreur insertion session :', insertError)
      return NextResponse.json({ error: 'Erreur création session' }, { status: 500 })
    }

    await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', availability_id)

    try {
      if (client?.email && coach?.email) {
        await sendClientConfirmationEmail({
          to: client.email,
          clientName: client.name,
          coachName: coach.name,
          date,
          time: new Date(date).toLocaleTimeString(),
          packageTitle: packageData?.title || '',
        })

        await sendCoachConfirmationEmail({
          to: coach.email,
          coachName: coach.name,
          clientName: client.name,
          date,
          time: new Date(date).toLocaleTimeString(),
          packageTitle: packageData?.title || '',
        })
      }
    } catch (err) {
      console.error('❌ Erreur envoi email :', err)
    }

    console.log('✅ RDV enregistré + emails envoyés')
  }

  // === CAS 2 : Activation abonnement via customer.subscription.created ===
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
          subscription_type: subscriptionType,
        })
        .eq('email', customerEmail)

      if (updateError) {
        console.error('❌ Erreur MAJ abonnement (created) :', updateError)
      } else {
        console.log(`✅ Abonnement ${subscriptionType} activé`)
      }
    } else {
      console.warn('⚠️ Email non trouvé pour customer_id :', customerId)
    }
  }

  // === CAS 3 : Désabonnement ===
  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer

    const { error: unsubError } = await supabase
      .from('users')
      .update({
        is_subscribed: false,
        stripe_subscription_id: null,
      })
      .eq('stripe_customer_id', customerId)

    if (unsubError) {
      console.error('❌ Erreur désabonnement :', unsubError)
    } else {
      console.log(`🚫 Désabonnement enregistré pour customer ${customerId}`)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
