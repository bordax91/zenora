'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token') // récupère le token de l'URL
  const type = searchParams.get('type')   // doit être "recovery"

  useEffect(() => {
    const establishSession = async () => {
      if (token && type === 'recovery') {
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token,
        })

        if (error) {
          console.error('Erreur setSession :', error.message)
          setError('Lien invalide ou expiré. Veuillez recommencer.')
        }
        setLoading(false)
      } else {
        setError('Lien invalide.')
        setLoading(false)
      }
    }

    establishSession()
  }, [token, type])

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Erreur lors de la mise à jour du mot de passe.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (!token || type !== 'recovery') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow">
          <h1 className="text-xl font-bold text-red-600 mb-2">Lien invalide ou expiré</h1>
          <p className="text-gray-600">Veuillez recommencer la procédure de récupération.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Nouveau mot de passe</h2>
        {loading && <p className="text-gray-500 mb-2">Chargement du lien de récupération…</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">Mot de passe modifié. Redirection…</p>}
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          className="w-full mb-3 border rounded px-4 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          className="w-full mb-4 border rounded px-4 py-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Réinitialiser le mot de passe
        </button>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
