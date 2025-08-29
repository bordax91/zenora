import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  // 👇 important pour que les cookies soient bien lus
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  // 👇 log temporaire pour debug
  console.log('👤 USER FROM MIDDLEWARE:', user)
  console.log('🔴 AUTH ERROR:', authError)

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('trial_start, trial_end, is_subscribed')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.warn('⛔ Profil non trouvé ou erreur Supabase')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const now = new Date()
  let trialEnd = null

  if (profile.trial_end) {
    trialEnd = new Date(profile.trial_end)
  } else if (profile.trial_start) {
    const trialStart = new Date(profile.trial_start)
    trialEnd = new Date(trialStart)
    trialEnd.setDate(trialStart.getDate() + 7)
  }

  const isTrialExpired = trialEnd ? now > trialEnd : true
  const isSubscribed = profile.is_subscribed === true

  if (isTrialExpired && !isSubscribed) {
    console.warn('🔒 Redirection vers /coach/subscribe')
    return NextResponse.redirect(new URL('/coach/subscribe', req.url))
  }

  return res
}

export const config = {
  matcher: ['/coach/:path*', '/:username'],
}
