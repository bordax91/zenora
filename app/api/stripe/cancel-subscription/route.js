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

    // 1. Récupérer l'abonnement actif du client
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    })

    const subscription = subscriptions.data[0]

    if (!subscription) {
      return NextResponse.json({ error: 'Aucun abonnement actif trouvé' }, { status: 404 })
    }

    // 2. Annuler à la fin de la période (pas immédiatement)
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    })

    // 3. (Facultatif) Mettre à jour Supabase pour stocker que l’abonnement est en cours d’annulation
    const { error: updateError } = await supabase
      .from('users')
      .update({ cancel_at_period_end: true }) // tu dois avoir cette colonne si tu veux suivre l'état
      .eq('stripe_customer_id', customerId)

    if (updateError) {
      console.error('❌ Erreur Supabase update cancel_at_period_end :', updateError)
      return NextResponse.json({ error: 'Erreur mise à jour Supabase' }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscription: updatedSubscription })
  } catch (err) {
    console.error('❌ Erreur Stripe cancel_at_period_end:', err.message)
    return NextResponse.json({ error: 'Erreur serveur Stripe' }, { status: 500 })
  }
}
