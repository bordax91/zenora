'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('code') || searchParams.get('token') // parfois "code" dans l'URL
  const type = searchParams.get('type')

  // 🔐 Vérifie et échange le token contre une session
  useEffect(() => {
    const verifyToken = async () => {
      if (token && type === 'recovery') {
        const { error } = await supabase.auth.exchangeCodeForSession({ code: token })
        if (error) {
          setError('Lien invalide ou expiré.')
        }
      } else {
        setError('Lien invalide ou expiré.')
      }
      setLoading(false)
    }

    verifyToken()
  }, [token, type])

  const handleReset = async () => {
    setError('')
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message || 'Erreur lors de la mise à jour.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Nouveau mot de passe</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">Mot de passe modifié. Redirection…</p>}
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          className="w-full mb-3 border rounded px-4 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          className="w-full mb-4 border rounded px-4 py-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Réinitialiser le mot de passe
        </button>
      </div>
    </div>
  )
}
