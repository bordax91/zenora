import stripe from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { packageId, clientId, availabilityId } = await req.json()

    if (!packageId || !clientId || !availabilityId) {
      return new Response(
        JSON.stringify({ error: 'Champs requis manquants (packageId, clientId, availabilityId)' }),
        { status: 400 }
      )
    }

    // 🔁 Récupérer les infos de l'offre
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select(`
        stripe_price_id,
        coach_id,
        coach:coach_id (
          username,
          stripe_account_id
        )
      `)
      .eq('id', packageId)
      .single()

    if (
      packageError ||
      !packageData?.coach?.username ||
      !packageData?.stripe_price_id ||
      !packageData?.coach?.stripe_account_id
    ) {
      console.error('❌ Supabase error ou données manquantes :', packageError)
      return new Response(
        JSON.stringify({ error: 'Offre introuvable ou incomplète' }),
        { status: 404 }
      )
    }

    // ✅ Vérifier que le créneau est disponible
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('availabilities')
      .select('date')
      .eq('id', availabilityId)
      .eq('is_booked', false)
      .single()

    if (availabilityError || !availabilityData) {
      return new Response(
        JSON.stringify({ error: 'Créneau introuvable ou déjà réservé' }),
        { status: 404 }
      )
    }

    // ✅ Vérifier que le client existe vraiment dans Supabase
    const { data: clientExists, error: clientError } = await supabase
      .from('users')
      .select('id')
      .eq('id', clientId)
      .maybeSingle()

    if (clientError || !clientExists) {
      console.error('❌ Client non trouvé dans Supabase:', clientError)
      return new Response(JSON.stringify({ error: 'Client introuvable dans la base' }), { status: 404 })
    }

    // ✅ Créer la session Stripe avec logs
    const metadata = {
      client_id: clientId,
      availability_id: availabilityId,
      package_id: packageId
    }

    console.log('✅ Metadata envoyée à Stripe :', metadata)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: packageData.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/client/dashboard?package=${packageId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${packageData.coach.username}`,
      metadata,
    }, {
      stripeAccount: packageData.coach.stripe_account_id,
    })

    if (!session?.url) {
      return new Response(
        JSON.stringify({ error: "Erreur de création de session Stripe." }),
        { status: 500 }
      )
    }

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
