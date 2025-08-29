'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token') || searchParams.get('code') // code = vrai param Supabase
  const type = searchParams.get('type')

  // 👇 Forcer Supabase à prendre en compte le token
  useEffect(() => {
    supabase.auth.getSession()
  }, [])

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Lien invalide ou expiré. Veuillez recommencer.')
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
