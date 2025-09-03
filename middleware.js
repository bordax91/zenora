// middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession() // 👈 récupère et attache la session
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // 🔐 protège toutes les routes sauf statiques
}
