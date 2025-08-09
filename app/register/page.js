'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') // ex: /zenoraapp/juliencoach

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isCoach, setIsCoach] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupère un redirect stocké par le login/overlay le cas échéant
  useEffect(() => {
    const pending = localStorage.getItem('pendingRedirect')
    if (!redirectParam && pending) {
      // si l’URL n’a pas de redirect mais qu’on en avait gardé un
      // on le laisse en localStorage (il sera consommé après)
    }
  }, [redirectParam])

  const resolveRedirect = (role: 'coach' | 'client') => {
    const local = localStorage.getItem('pendingRedirect')
    const target = redirectParam || local || (role === 'coach' ? '/coach/dashboard' : '/client/dashboard')
    localStorage.removeItem('pendingRedirect')
    return target
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const role = isCoach ? 'coach' : 'client'

      // 1) Sign up + stocker le rôle dans user_metadata
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      })
      if (signErr) throw signErr

      const user = data.user
      if (!user) throw new Error("Inscription échouée, réessayez.")

      // 2) Upsert dans la table 'users'
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email,
            role,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      if (upsertErr) throw upsertErr

      // 3) Redirection
      localStorage.setItem('isLoggedIn', 'true')
      router.push(resolveRedirect(role))
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    const role = isCoach ? 'coach' : 'client'
    // on stocke le rôle + le redirect pour les récupérer dans /auth/callback
    localStorage.setItem('pendingRole', role)
    if (redirectParam) localStorage.setItem('pendingRedirect', redirectParam)

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Créer un compte Zenora</h1>

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
