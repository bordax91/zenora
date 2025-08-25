import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import stripe from '@/lib/stripe'

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const metadata = session.metadata || {}

    const clientId = metadata.client_id
    const packageId = metadata.package_id
    const availabilityId = metadata.availability_id

    if (!clientId || !packageId || !availabilityId) {
      console.error('❌ Metadata incomplète', metadata)
      return NextResponse.json({ error: 'Metadata manquante' }, { status: 400 })
    }

    // 🔍 Récupérer la disponibilité
    const { data: availability, error: availabilityError } = await supabase
      .from('availabilities')
      .select('date, coach_id, is_booked')
      .eq('id', availabilityId)
      .single()

    if (availabilityError || !availability) {
      console.error('❌ Disponibilité non trouvée :', availabilityError)
      return NextResponse.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }

    // 🚫 Si déjà réservé, ne rien faire
    if (availability.is_booked) {
      console.warn('⚠️ Créneau déjà réservé, pas de double insertion.')
      return NextResponse.json({ message: 'Déjà réservé' }, { status: 200 })
    }

    const { coach_id, date } = availability

    // ✅ Créer la session
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
    const { error: updateError } = await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', availabilityId)

    if (updateError) {
      console.error('❌ Erreur update disponibilité :', updateError)
      return NextResponse.json({ error: 'Impossible de bloquer la disponibilité' }, { status: 500 })
    }

    console.log('✅ Session créée et créneau réservé 👍')
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
