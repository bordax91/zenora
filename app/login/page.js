'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const nextParam = search.get('next') || '' // ex: /reserve?session=...
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const afterLoginRedirect = async () => {
    // si on a une cible explicite -> on y va
    if (nextParam) {
      router.replace(nextParam)
      return
    }
    // sinon, on route par rôle
    const { data } = await supabase.auth.getUser()
    const role = data?.user?.user_metadata?.role || 'client'
    router.replace(role === 'coach' ? '/coach/dashboard' : '/client/dashboard')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message || "Connexion impossible")
      return
    }
    if (data?.user) {
      localStorage.setItem('isLoggedIn', 'true')
      afterLoginRedirect()
    }
  }

  const handleGoogleLogin = async () => {
    const base = `${window.location.origin}/auth/callback`
    const redirectTo = nextParam ? `${base}?next=${encodeURIComponent(nextParam)}` : base

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
            <span className="text-lg font-semibold text-gray-800">Zenora</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Connexion Zenora</h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-600 mb-1">Adresse email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="prenom@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre mot de passe"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-4 text-sm text-gray-400">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Connexion Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Se connecter avec Google
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link href={`/register${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`} className="text-blue-600 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
