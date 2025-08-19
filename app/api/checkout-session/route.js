import stripe from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { packageId } = await req.json()

    if (!packageId) {
      return new Response(JSON.stringify({ error: 'packageId manquant' }), {
        status: 400,
      })
    }

    console.log('⏎ packageId reçu :', packageId)

    const { data: packageData, error } = await supabase
      .from('packages')
      .select(`
        stripe_price_id,
        coach_id,
        coach:coach_id (
          username
        )
      `)
      .eq('id', packageId)
      .single()

    if (error || !packageData?.coach?.username || !packageData?.stripe_price_id) {
      console.error('❌ Supabase error or données manquantes :', error)
      return new Response(
        JSON.stringify({ error: 'Offre introuvable, coach sans username ou price manquant' }),
        { status: 404 }
      )
    }

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
    console.error('❌ Stripe checkout error :', err)
    return new Response(JSON.stringify({ error: err.message || 'Erreur serveur' }), {
      status: 500,
    })
  }
}
