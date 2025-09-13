'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ---- Signup email/password ----
  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'coach' } },
      })

      if (error) throw error

      console.log('✅ Compte créé', data)
      router.replace('/auth/callback')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ---- Signup Google OAuth ----
  const handleGoogleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:3000/auth/callback'
              : 'https://zenoraapp.com/auth/callback',
          queryParams: { prompt: 'select_account' },
        },
      })

      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
            <span className="text-lg font-semibold">Zenora</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Créer un compte Coach</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            {loading ? 'Création…' : "S'inscrire"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-4 text-sm text-gray-400">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Bouton Google */}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg"
        >
          <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
          S’inscrire avec Google
        </button>
      </div>
    </div>
  )
}
