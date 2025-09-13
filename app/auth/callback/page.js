'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabase' // ton fichier

export default function AuthCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        const code = params.get('code')
        if (!code) {
          setError('Aucun code reçu dans le callback.')
          return
        }

        // 🔑 Échange du code OAuth → session Supabase
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Erreur échange code → session:', error)
          setError(error.message)
          return
        }

        console.log('✅ Session récupérée :', data)

        // Récupère le rôle stocké (si défini)
        const role = localStorage.getItem('pendingRole') || 'client'
        const redirectTo =
          localStorage.getItem('pendingRedirect') ||
          (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // Nettoyage du localStorage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.setItem('isLoggedIn', 'true')

        // 🚀 Redirection finale
        router.replace(redirectTo)
      } catch (err) {
        console.error('Callback error:', err)
        setError(err.message || 'Erreur inattendue lors du callback.')
      }
    }

    run()
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600 text-center">
      {error || 'Connexion en cours...'}
    </div>
  )
}
