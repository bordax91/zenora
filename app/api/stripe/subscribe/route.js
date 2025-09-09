import stripe from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Connexion Supabase avec la clé de service
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    // Extraction du body JSON
    const { userId, priceId } = await req.json()

    // Vérification des champs
    if (!userId || !priceId) {
      return NextResponse.json({ error: 'Champs requis manquants (userId, priceId)' }, { status: 400 })
    }

    // Récupération de l'utilisateur pour son email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !user?.email) {
      console.error('❌ Utilisateur non trouvé ou email manquant :', userError)
      return NextResponse.json({ error: 'Utilisateur non trouvé ou email manquant' }, { status: 404 })
    }

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: userId, // utile pour tracking
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        coach_id: userId,
      },
      subscription_data: {
        metadata: {
          coach_id: userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/subscribe?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/subscribe?canceled=true`,
    })

    console.log('✅ Session Stripe créée :', session.id)

    return NextResponse.json({ url: session.url }, { status: 200 })

  } catch (error) {
    console.error('❌ Erreur création session abonnement :', error)
    return NextResponse.json({ error: 'Erreur serveur Stripe' }, { status: 500 })
  }
}
