'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        console.log('🔄 [AuthCallback] Démarrage...')

        // 1. Échanger le code contre une session Supabase
        const { data: sessionData, error: exchangeErr } =
          await supabase.auth.exchangeCodeForSession(window.location.href)

        if (exchangeErr) {
          console.error('❌ [exchangeCodeForSession]', exchangeErr)
          throw exchangeErr
        }

        console.log('✅ Session récupérée :', sessionData)

        // 2. Récupération utilisateur
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error("Impossible de récupérer l’utilisateur.")
        }

        const user = userData.user
        console.log('👤 Utilisateur connecté :', user)

        // 3. Récupérer rôle et infos trial depuis localStorage
        const role = localStorage.getItem('pendingRole') || 'client'
        const trialStart =
          localStorage.getItem('pendingTrialStart') || new Date().toISOString()
        const trialEnd =
          localStorage.getItem('pendingTrialEnd') ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        // 4. Upsert dans `users`
        const { error: upsertErr } = await supabase.from('users').upsert(
          {
            id: user.id,
            email: user.email,
            role,
            trial_start: trialStart,
            trial_end: trialEnd,
            is_subscribed: false,
          },
          { onConflict: 'id' }
        )

        if (upsertErr) {
          console.error('❌ [users upsert]', upsertErr)
          throw upsertErr
        }

        console.log('✅ Utilisateur ajouté/mis à jour en DB')

        // 5. Déterminer la redirection
        const storedRedirect = localStorage.getItem('pendingRedirect')
        const redirectTo =
          storedRedirect || (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // Nettoyage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.setItem('isLoggedIn', 'true')

        // 6. Redirection
        window.location.replace(redirectTo)
      } catch (e) {
        console.error('❌ [AuthCallback ERROR]', e)
        setError(e?.message || 'Erreur de connexion.')
      }
    }

    run()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600 text-center px-4">
      {error || 'Connexion en cours...'}
    </div>
  )
}
