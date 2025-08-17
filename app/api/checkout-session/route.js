import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-08-01',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.json()
  const { packageId } = body

  if (!packageId) {
    return new Response(JSON.stringify({ error: 'packageId manquant' }), {
      status: 400,
    })
  }

  // 🔍 1. Récupère le package depuis Supabase
  const { data: packageData, error } = await supabase
    .from('packages')
    .select('stripe_price_id, coach_id, coach:coach_id(username)')
    .eq('id', packageId)
    .single()

  if (error || !packageData) {
    return new Response(JSON.stringify({ error: 'Offre introuvable' }), {
      status: 404,
    })
  }

  try {
    // 🎯 2. Crée la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: packageData.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?coach=${packageData.coach.username}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${packageData.coach.username}`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
    })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    })
  }
}
