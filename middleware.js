import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  // ✅ Si pas connecté → redirection login
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🔍 Récupérer les infos de l'utilisateur
  const { data: profile, error } = await supabase
    .from('users')
    .select('trial_start, is_subscribed')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const now = new Date()
  const trialStart = new Date(profile.trial_start)
  const trialEnd = new Date(trialStart)
  trialEnd.setDate(trialStart.getDate() + 7) // ✅ 7 jours d’essai

  const isTrialExpired = now > trialEnd
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
