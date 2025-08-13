import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.json()
  const { priceId, coachUsername } = body

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?coach=${coachUsername}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${coachUsername}`,
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
