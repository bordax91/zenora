'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      try {
        console.log('🔄 [AuthCallback] Tentative récupération session...')

        // 👤 Récupération directe de l’utilisateur (PKCE géré par Supabase)
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          throw error || new Error("Impossible de récupérer l’utilisateur.")
        }

        console.log('✅ Utilisateur récupéré :', user)

        // 🎯 Rôle depuis localStorage (ou par défaut client)
        const role = localStorage.getItem('pendingRole') || 'client'
        const redirectTo =
          localStorage.getItem('pendingRedirect') ||
          (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // Nettoyage localStorage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.setItem('isLoggedIn', 'true')

        // 🚀 Redirection finale
        router.replace(redirectTo)
      } catch (err) {
        console.error('❌ [AuthCallback ERROR]', err)
        setError(err.message || 'Erreur de connexion. Veuillez réessayer.')
      }
    }

    run()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600 text-center">
      {error || 'Connexion en cours...'}
    </div>
  )
}
