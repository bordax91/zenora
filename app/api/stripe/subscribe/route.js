import stripe from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { userId, priceId } = await req.json()

    if (!userId || !priceId) {
      return NextResponse.json({ error: 'Champs requis manquants (userId, priceId)' }, { status: 400 })
    }

    // 🔍 Récupérer l'utilisateur pour l'email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // ✅ Créer la session Stripe pour abonnement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        coach_id: userId
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/subscribe`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/subscribe`,
    })

    return NextResponse.json({ url: session.url }, { status: 200 })

  } catch (error) {
    console.error('❌ Erreur création session abonnement :', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
