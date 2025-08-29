'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if the user is authenticated via the magic link
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        setMessage("Lien invalide ou expiré. Veuillez recommencer.")
      }
    }
    checkSession()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    setMessage('')

    if (newPassword.length < 6) {
      return setMessage('Le mot de passe doit contenir au moins 6 caractères.')
    }

    if (newPassword !== confirmPassword) {
      return setMessage('Les mots de passe ne correspondent pas.')
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('✅ Mot de passe mis à jour. Redirection...')
      setTimeout(() => router.push('/login'), 2000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Nouveau mot de passe</h1>

        {message && (
          <p className="text-center text-sm mb-4 text-red-600">{message}</p>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}
