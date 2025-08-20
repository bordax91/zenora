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
  } catch (err) {
    console.error('❌ Erreur signature webhook Stripe :', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (!session.metadata) {
      console.error('❌ Pas de metadata dans la session Stripe')
      return NextResponse.json({ error: 'Metadata manquante' }, { status: 400 })
    }

    const clientId = session.metadata.client_id
    const sessionId = session.metadata.session_id

    if (!clientId || !sessionId) {
      console.error('❌ Données metadata manquantes')
      return NextResponse.json({ error: 'client_id ou session_id manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .from('sessions')
      .update({
        client_id: clientId,
        statut: 'réservé'
      })
      .eq('id', sessionId)

    if (error) {
      console.error('❌ Erreur mise à jour Supabase :', error)
      return NextResponse.json({ error: 'Erreur Supabase' }, { status: 500 })
    }

    console.log('✅ Session réservée avec succès :', sessionId)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
