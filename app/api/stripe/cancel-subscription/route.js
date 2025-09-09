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

    if (!customerId || typeof customerId !== 'string') {
      return NextResponse.json({ error: '❌ customerId manquant ou invalide' }, { status: 400 })
    }

    // 1. Récupérer l'abonnement actif du client
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    })

    if (!subscriptions?.data?.length) {
      return NextResponse.json({ error: '❌ Aucun abonnement actif trouvé' }, { status: 404 })
    }

    const subscription = subscriptions.data[0]

    // 2. Annuler à la fin de la période
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    })

    // 3. MAJ Supabase : marquer l’annulation prochaine
    const { error: updateError } = await supabase
      .from('users')
      .update({ cancel_at_period_end: true })
      .eq('stripe_customer_id', customerId)

    if (updateError) {
      console.error('❌ Erreur Supabase (cancel_at_period_end):', updateError)
      return NextResponse.json({ error: 'Erreur mise à jour Supabase' }, { status: 500 })
    }

    console.log(`✅ Abonnement ${subscription.id} mis à cancel_at_period_end`)

    return NextResponse.json({ success: true, subscription: updatedSubscription })
  } catch (err) {
    console.error('❌ Erreur Stripe cancel:', err.message)
    return NextResponse.json({ error: 'Erreur serveur Stripe' }, { status: 500 })
  }
}
