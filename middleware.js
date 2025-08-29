import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ✅ Rediriger vers /login si non connecté
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🔍 Charger les infos utilisateur : trial_start, trial_end, is_subscribed
  const { data: profile, error } = await supabase
    .from('users')
    .select('trial_start, trial_end, is_subscribed')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const now = new Date()
  let trialEnd

  // ✅ Si trial_end existe, on l’utilise
  if (profile.trial_end) {
    trialEnd = new Date(profile.trial_end)
  }
  // ✅ Sinon, on calcule depuis trial_start
  else if (profile.trial_start) {
    const trialStart = new Date(profile.trial_start)
    trialEnd = new Date(trialStart)
    trialEnd.setDate(trialStart.getDate() + 7)
  }
  // ❌ Aucun essai, accès interdit sauf si abonné
  else {
    trialEnd = null
  }

  const isTrialExpired = trialEnd ? now > trialEnd : true
  const isSubscribed = profile.is_subscribed

  // ✅ Redirection vers l’abonnement si essai expiré et non abonné
  if (isTrialExpired && !isSubscribed) {
    return NextResponse.redirect(new URL('/coach/subscribe', req.url))
  }

  return res
}

// ✅ Middleware actif sur les routes coach & profils publics
export const config = {
  matcher: ['/coach/:path*', '/:username'],
}
