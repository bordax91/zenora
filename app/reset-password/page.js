'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const fragmentParams = new URLSearchParams(window.location.hash.slice(1))
    const access_token = fragmentParams.get('access_token')
    const refresh_token = fragmentParams.get('refresh_token')
    const type = fragmentParams.get('type')

    const establishSession = async () => {
      if (access_token && refresh_token && type === 'recovery') {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) {
          console.error('Erreur setSession :', error.message)
          setError('Lien invalide ou expiré. Veuillez recommencer.')
        }
      } else {
        console.warn('Token manquant ou type incorrect')
        setError('Lien invalide ou expiré.')
      }

      setLoading(false)
    }

    establishSession()
  }, [])

  const handleReset = async () => {
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('Erreur updateUser :', error.message)
      setError('Erreur lors de la mise à jour du mot de passe.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Nouveau mot de passe</h2>
        {loading && <p className="text-gray-500 mb-2">Chargement du lien de récupération…</p>}
        {!loading && error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">Mot de passe modifié. Redirection…</p>}
        {!success && (
          <>
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
          </>
        )}
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
