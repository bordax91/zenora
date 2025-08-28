import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId requis' }, { status: 400 })
    }

    // 1. Récupérer l'abonnement actif
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    })

    const subscription = subscriptions.data[0]

    if (!subscription) {
      return NextResponse.json({ error: 'Abonnement actif introuvable' }, { status: 404 })
    }

    // 2. Supprimer l’abonnement côté Stripe
    await stripe.subscriptions.del(subscription.id)

    // 3. Supprimer le statut dans Supabase
    const { error } = await supabase
      .from('users')
      .update({ is_subscribed: false })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Erreur Supabase :', error)
      return NextResponse.json({ error: 'Erreur mise à jour Supabase' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur Stripe:', err.message)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
