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

    // ✅ Récupérer la date du créneau (pour la session)
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('availabilities')
      .select('date')
      .eq('id', availabilityId)
      .eq('is_booked', false) // Ne pas autoriser si déjà réservé
      .single()

    if (availabilityError || !availabilityData) {
      return new Response(
        JSON.stringify({ error: 'Créneau introuvable ou déjà réservé' }),
        { status: 404 }
      )
    }

    // ✅ Insérer la session dans Supabase
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        coach_id: packageData.coach_id,
        client_id: clientId,
        package_id: packageId,
        availability_id: availabilityId,
        date: availabilityData.date,
        statut: 'réservé'
      })
      .select('id')
      .single()

    if (sessionError) {
      console.error('❌ Erreur insertion session :', sessionError)
      return new Response(
        JSON.stringify({ error: 'Impossible de créer la session dans la base' }),
        { status: 500 }
      )
    }

    // ✅ Mettre à jour le créneau comme réservé
    const { error: updateError } = await supabase
      .from('availabilities')
      .update({ is_booked: true })
      .eq('id', availabilityId)

    if (updateError) {
      console.error('❌ Erreur mise à jour availability :', updateError)
      return new Response(
        JSON.stringify({ error: 'Créneau non mis à jour comme réservé' }),
        { status: 500 }
      )
    }

    // ✅ Créer la session Stripe
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
      metadata: {
        client_id: clientId,
        session_id: sessionData.id,
        availability_id: availabilityId,
      },
    }, {
      stripeAccount: packageData.coach.stripe_account_id,
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
