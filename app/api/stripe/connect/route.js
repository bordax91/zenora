import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ pas l'anon key ici
)

export async function POST(request) {
  try {
    const body = await request.json()
    const userId = body.userId

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 })
    }

    // Récupère les infos de l’utilisateur depuis Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('email, stripe_account_id')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    let accountId = user.stripe_account_id

    // Si l'utilisateur n’a pas encore de compte Stripe, on en crée un
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: user.email,
      })

      accountId = account.id

      // Sauvegarde le compte Stripe dans Supabase
      await supabase
        .from('users')
        .update({ stripe_account_id: accountId })
        .eq('id', userId)
    }

    // Crée un lien Stripe Connect pour que l’utilisateur finalise la configuration
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/integrations`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/coach/integrations`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error('Erreur Stripe Connect:', err)
    return NextResponse.json({ error: 'Erreur interne Stripe' }, { status: 500 })
  }
}
