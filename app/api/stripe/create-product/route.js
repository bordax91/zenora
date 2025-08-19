import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { title, description, price, coachId } = body

    if (!title || !price || !coachId) {
      return new Response(JSON.stringify({ error: 'Champs requis manquants' }), { status: 400 })
    }

    // 🔍 1. Récupérer le compte Stripe du coach
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', coachId)
      .single()

    if (userError) {
      console.error('Erreur récupération utilisateur:', userError)
      return new Response(JSON.stringify({ error: 'Erreur récupération utilisateur' }), { status: 500 })
    }

    const stripeAccount = user?.stripe_account_id
    if (!stripeAccount) {
      return new Response(JSON.stringify({ error: 'Aucun compte Stripe connecté' }), { status: 403 })
    }

    // 🛒 2. Créer le produit Stripe
    const product = await stripe.products.create(
      {
        name: title,
        description,
      },
      { stripeAccount }
    )

    // 💰 3. Créer le prix Stripe
    const stripePrice = await stripe.prices.create(
      {
        unit_amount: Math.round(price * 100),
        currency: 'eur',
        product: product.id,
      },
      { stripeAccount }
    )

    // 💾 4. Enregistrer dans Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('packages')
      .insert([
        {
          title,
          description,
          price,
          coach_id: coachId,
          stripe_product_id: product.id,
          stripe_price_id: stripePrice.id,
        },
      ])
      .select()

    if (insertError) {
      console.error('Erreur insertion Supabase :', insertError)
      throw insertError
    }

    if (!inserted || inserted.length === 0) {
      return new Response(JSON.stringify({ error: 'Aucune donnée retournée par Supabase.' }), { status: 500 })
    }

    return new Response(JSON.stringify(inserted[0]), { status: 200 })
  } catch (err) {
    console.error('Erreur création produit:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
