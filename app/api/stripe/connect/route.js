import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 })
    }

    // 🔍 Récupérer l'utilisateur depuis Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('email, stripe_account_id')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    let accountId = user.stripe_account_id

    // 🆕 Création du compte Stripe s'il n'existe pas encore
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: user.email,
      })

      accountId = account.id

      // 💾 Mise à jour dans Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_account_id: accountId })
        .eq('id', userId)

      if (updateError) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour Supabase' }, { status: 500 })
      }
    }

    // 🔗 Création du lien Stripe Connect
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/integrations`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/integrations`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })

  } catch (err) {
    console.error('❌ Erreur Stripe Connect:', err)
    return NextResponse.json({ error: 'Erreur interne Stripe' }, { status: 500 })
  }
}
