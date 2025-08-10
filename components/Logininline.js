'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function LoginInline({ redirect = '/' }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const signIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  const signUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'client' } }, // par défaut
    })
    setLoading(false)
    if (error) setError(error.message)
  }

  const google = async () => {
    const base = `${window.location.origin}/auth/callback`
    const redirectTo = redirect ? `${base}?redirect=${encodeURIComponent(redirect)}` : base
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams: { prompt: 'select_account' } },
    })
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        {mode === 'login' ? 'Connexion' : 'Créer un compte'}
      </h2>

      <form onSubmit={mode === 'login' ? signIn : signUp} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Adresse email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
        >
          {loading ? 'Patientez…' : (mode === 'login' ? 'Se connecter' : "S’inscrire")}
        </button>
      </form>

      <div className="flex items-center my-5">
        <div className="flex-grow h-px bg-gray-200" />
        <span className="mx-3 text-xs text-gray-400">ou</span>
        <div className="flex-grow h-px bg-gray-200" />
      </div>

      <button
        onClick={google}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg"
      >
        Continuer avec Google
      </button>

      <p className="text-center text-sm text-gray-600 mt-4">
        {mode === 'login' ? (
          <>Pas de compte ? <button className="text-blue-600 font-medium" onClick={() => setMode('register')}>S’inscrire</button></>
        ) : (
          <>Déjà inscrit ? <button className="text-blue-600 font-medium" onClick={() => setMode('login')}>Se connecter</button></>
        )}
      </p>
    </div>
  )
}
