'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

export default function RegisterPageInner() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      const role = 'coach'

      // Création du compte email/password
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      })
      if (signErr) throw signErr

      const user = data?.user
      if (!user) {
        setInfo("Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis reconnectez-vous.")
        return
      }

      // Dates d’essai gratuit (7 jours)
      const trialStart = new Date()
      const trialEnd = new Date(trialStart)
      trialEnd.setDate(trialStart.getDate() + 7)

      // Ajout ou mise à jour dans la table `users`
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email,
            role,
            trial_start: trialStart.toISOString(),
            trial_end: trialEnd.toISOString(),
            is_subscribed: false,
          },
          { onConflict: 'id' }
        )
      if (upsertErr) throw upsertErr

      // Email de bienvenue
      await fetch('/api/emails/send-welcome-coach-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email }),
      })

      localStorage.setItem('isLoggedIn', 'true')
      router.replace('/coach/onboarding')
    } catch (err) {
      console.error('[register error]', err)
      setError(err?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const role = 'coach'
      const trialStart = new Date()
      const trialEnd = new Date(trialStart)
      trialEnd.setDate(trialStart.getDate() + 7)

      // Stockage avant redirection
      localStorage.setItem('pendingRole', role)
      localStorage.setItem('pendingTrialStart', trialStart.toISOString())
      localStorage.setItem('pendingTrialEnd', trialEnd.toISOString())
      localStorage.setItem('pendingRedirect', '/coach/onboarding')

      const redirectTo = `${window.location.origin}/auth/callback`
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      })

      if (error) {
        console.error('Erreur OAuth Google :', error.message)
        setError('Erreur avec la connexion Google. Veuillez réessayer.')
        return
      }

      if (data?.url) {
        console.log('🔁 Redirection vers Google OAuth :', data.url)
        window.location.href = data.url
      } else {
        console.error('❌ URL de redirection manquante dans la réponse Supabase.')
        setError("La redirection vers Google n'a pas pu être lancée.")
      }
    } catch (err) {
      console.error('Erreur générale OAuth Google:', err)
      setError('Erreur inattendue avec Google.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
            <span className="text-lg font-semibold text-gray-800">Zenora</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Créer un compte Coach
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
          <Link href="/login?redirect=/coach/onboarding" className="text-blue-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
