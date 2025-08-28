import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID manquant' }, { status: 400 })
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all', // ou 'active' uniquement si tu veux filtrer
      expand: ['data.items.data.price']
    })

    return NextResponse.json({ data: subscriptions.data })
  } catch (error) {
    console.error('❌ Erreur Stripe get-subscription :', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de l’abonnement Stripe' }, { status: 500 })
  }
}
