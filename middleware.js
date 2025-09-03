// middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  await supabase.auth.getSession()

  return res
}

// Appliquer ce middleware uniquement à certaines routes si besoin
export const config = {
  matcher: [
    '/app/api/:path*',
    '/coach/prospection', // la page de prospection
    // ajoute ici d'autres routes qui ont besoin de l'auth Supabase côté serveur
  ]
}
