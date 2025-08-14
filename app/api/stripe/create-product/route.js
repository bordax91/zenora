import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.json()
  const { title, description, price, coachId } = body

  if (!title || !price || !coachId) {
    return new Response(JSON.stringify({ error: 'Champs requis manquants' }), { status: 400 })
  }

  try {
    // 1. Récupérer le compte Stripe du coach
    const { data: user } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', coachId)
      .single()

    const stripeAccount = user?.stripe_account_id
    if (!stripeAccount) {
      return new Response(JSON.stringify({ error: 'Aucun compte Stripe connecté' }), { status: 403 })
    }

    // 2. Créer le produit Stripe
    const product = await stripe.products.create(
      {
        name: title,
        description,
      },
      { stripeAccount } // ⚠️ Créé sur le compte du coach
    )

    // 3. Créer le prix Stripe
    const stripePrice = await stripe.prices.create(
      {
        unit_amount: price * 100, // en centimes
        currency: 'eur',
        product: product.id,
      },
      { stripeAccount }
    )

    // 4. Sauvegarder dans Supabase
    const { data, error } = await supabase.from('packages').insert([
      {
        title,
        description,
        price,
        coach_id: coachId,
        stripe_product_id: product.id,
        stripe_price_id: stripePrice.id,
      },
    ])

    if (error) throw error

    return new Response(JSON.stringify(data[0]), { status: 200 })
  } catch (err) {
    console.error('Erreur création produit:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
