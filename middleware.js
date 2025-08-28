import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ✅ Si pas connecté → redirection login
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🔍 Récupérer les infos de l'utilisateur
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

  if (profile.trial_end) {
    trialEnd = new Date(profile.trial_end)
  } else if (profile.trial_start) {
    const trialStart = new Date(profile.trial_start)
    trialEnd = new Date(trialStart)
    trialEnd.setDate(trialStart.getDate() + 7)
  } else {
    trialEnd = null // Aucun essai enregistré
  }

  const isTrialExpired = trialEnd ? now > trialEnd : true
  const isSubscribed = profile.is_subscribed

  // ✅ Si l'utilisateur n’a plus droit → redirection abonnement
  if (isTrialExpired && !isSubscribed) {
    return NextResponse.redirect(new URL('/coach/subscribe', req.url))
  }

  return res
}

// ✅ Appliquer à /app/coach/** et /app/:username
export const config = {
  matcher: ['/app/coach/:path*', '/app/:username'],
}
