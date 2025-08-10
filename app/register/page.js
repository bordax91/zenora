'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ex: /register?redirect=/zenoraapp/johndoe
  const rawRedirect = searchParams.get('redirect') || ''
  // n’autorise que les chemins internes
  const redirectParam = useMemo(() => {
    return rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : ''
  }, [rawRedirect])

  // /register?role=coach pour pré-cocher
  const isUrlCoach = searchParams.get('role') === 'coach'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isCoach, setIsCoach] = useState(isUrlCoach)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null) // message confirmation email

  // si on vient de l’overlay login, on peut avoir un redirect en localStorage
  useEffect(() => {
    // on ne fait rien ici volontairement : il sera consommé plus bas
  }, [])

  const resolveRedirect = (role) => {
    const stored = localStorage.getItem('pendingRedirect') || ''
    localStorage.removeItem('pendingRedirect')

    if (redirectParam) return redirectParam
    if (stored && stored.startsWith('/')) return stored
    return role === 'coach' ? '/coach/dashboard' : '/client/dashboard'
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      const role = isCoach ? 'coach' : 'client'

      // 1) Création compte + rôle dans user_metadata
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      })
      if (signErr) throw signErr

      const user = data?.user

      // Cas fréquent : vérification email activée -> pas de session immédiate
      if (!user) {
        setInfo(
          "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis reconnectez‑vous."
        )
        return
      }

      // 2) Upsert dans table users (idempotent)
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert(
          { id: user.id, email: user.email, role },
          { onConflict: 'id' }
        )
      if (upsertErr) throw upsertErr

      // 3) Redirection finale
      localStorage.setItem('isLoggedIn', 'true')
      router.replace(resolveRedirect(role))
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    const role = isCoach ? 'coach' : 'client'
    localStorage.setItem('pendingRole', role)
    if (redirectParam) localStorage.setItem('pendingRedirect', redirectParam)

    const base = `${window.location.origin}/auth/callback`
    const redirectTo = redirectParam ? `${base}?redirect=${encodeURIComponent(redirectParam)}` : base

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo Zenora */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
            <span className="text-lg font-semibold text-gray-800">Zenora</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Créer un compte Zenora
        </h1>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-600 mb-1">Adresse email</label>
            <input
              id="email"
              type="email"
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
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Créer un mot de passe"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isCoach"
              type="checkbox"
              checked={isCoach}
              onChange={(e) => setIsCoach(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isCoach" className="text-sm text-gray-600">Vous êtes coach ?</label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {info && <p className="text-green-600 text-sm">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Création du compte…' : "S'inscrire"}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-4 text-sm text-gray-400">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
        >
          S’inscrire avec Google
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          Déjà inscrit ?{' '}
          <Link
            href={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            className="text-blue-600 font-semibold hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
