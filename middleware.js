import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Récupérer l'utilisateur dans la table Supabase
  const { data: profile, error } = await supabase
    .from('users')
    .select('trial_end, is_subscribed')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const now = new Date()
  const trialEnd = new Date(profile.trial_end)

  const isTrialExpired = now > trialEnd
  const isSubscribed = profile.is_subscribed

  if (isTrialExpired && !isSubscribed) {
    return NextResponse.redirect(new URL('/coach/abonnement', req.url))
  }

  return res
}

// Appliquer uniquement à toutes les routes dans /app/coach/**
export const config = {
  matcher: ['/app/coach/:path*'],
}
