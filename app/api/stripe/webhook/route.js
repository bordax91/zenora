import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import stripe from '@/lib/stripe'
import { sendClientConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'
import { sendCoachConfirmationEmail } from '@/app/api/emails/send-confirmation-email/route'

// Secrets des deux comptes Stripe
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
  let event

  // ✅ Détection dynamique du bon secret à utiliser
  const isConnectedAccount = req.headers.get('stripe-account') !== null
  const secretToUse = isConnectedAccount ? secretConnected : secretMain

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secretToUse)
    console.log('✅ Webhook Stripe reçu :', event.type)
  } catch (err) {
    console.error('❌ Signature Stripe invalide :', err.message)
    return NextResponse.json({ error: 'Signature Stripe invalide' }, { status: 400 })
  }

  const session = event.data.object
  const metadata = session.metadata || {}

  // === CAS 1 : Paiement RDV (coach connecté)
  if (
    event.type === 'checkout.session.completed' &&
    metadata.client_id &&
    metadata.package_id &&
    metadata.availability_id
  ) {
    const { client_id, package_id, availability_id } = metadata

    const { data: availability, error: availabilityError } = await supabase
      .from('availabilities')
      .select('date, coach_id, is_booked')
      .eq('id', availability_id)
      .single()

    if (availabilityError || !availability) {
      console.error('❌ Créneau indisponible :', availabilityError)
      return NextResponse.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }

    if (availability.is_booked) {
      console.warn('⚠️ Créneau déjà réservé')
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
      console.error('❌ Erreur enregistrement session :', insertError)
      return NextResponse.json({ error: 'Erreur session' }, { status: 500 })
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
    } catch (emailErr) {
      console.error('❌ Erreur envoi emails :', emailErr)
    }

    console.log('✅ RDV confirmé + emails envoyés')
  }

  // === CAS 2 : Abonnement (checkout.session.completed)
  if (
    event.type === 'checkout.session.completed' &&
    session.mode === 'subscription' &&
    metadata.coach_id
  ) {
    const coachId = metadata.coach_id
    const customerId = session.customer
    const priceId =
      session.subscription_details?.plan?.id ||
      session.items?.[0]?.price?.id ||
      null

    let subscriptionType = 'inconnu'
    if (
      priceId === process.env.STRIPE_PRICE_ID_MONTHLY ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST_MONTHLY
    ) {
      subscriptionType = 'mensuel'
    } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
      subscriptionType = 'annuel'
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_subscribed: true,
        stripe_customer_id: customerId,
        subscription_started_at: new Date().toISOString(),
        subscription_type: subscriptionType,
      })
      .eq('id', coachId)

    if (updateError) {
      console.error('❌ Erreur MAJ abonnement coach :', updateError)
    } else {
      console.log(`✅ Abonnement ${subscriptionType} activé pour coach ${coachId}`)
    }
  }

  // === CAS 3 : Désabonnement (customer.subscription.deleted)
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
      console.log(`🚫 Coach désabonné (customer ${customerId})`)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
