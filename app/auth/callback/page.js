'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        console.log('🔄 [AuthCallback] Début du process...')

        // ✅ Restaure le code_verifier si perdu (Google OAuth reset parfois le sessionStorage)
        const localVerifier = localStorage.getItem('code_verifier')
        if (localVerifier) {
          sessionStorage.setItem('supabase.auth.token#code_verifier', localVerifier)
          console.log('🔑 code_verifier restauré depuis localStorage')
        }

        // 🔑 Échange du code OAuth → session Supabase
        const { data: sessionData, error: exchangeErr } =
          await supabase.auth.exchangeCodeForSession(window.location.href)

        if (exchangeErr) {
          console.error('❌ [exchangeCodeForSession error]', exchangeErr)
          throw exchangeErr
        }

        console.log('✅ Session échangée avec succès !', sessionData)

        // 👤 Récupération de l’utilisateur
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error("Impossible de récupérer l’utilisateur.")
        }

        const user = userData.user
        console.log('👤 Utilisateur récupéré :', user)

        // 🎯 Rôle depuis localStorage (ou fallback client)
        const role = localStorage.getItem('pendingRole') || 'client'

        // 🗓️ Période d’essai gratuite (7 jours)
        const trialStart = new Date()
        const trialEnd = new Date(trialStart)
        trialEnd.setDate(trialStart.getDate() + 7)

        // 💾 Insertion/màj dans `users`
        const { error: upsertErr } = await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email,
              role,
              trial_start: trialStart.toISOString(),
              trial_end: trialEnd.toISOString(),
              is_subscribed: false,
            },
            { onConflict: 'id' }
          )

        if (upsertErr) throw upsertErr
        console.log('✅ Utilisateur inséré/mis à jour dans users')

        // 🚀 Redirection après login
        const storedRedirect = localStorage.getItem('pendingRedirect')
        const redirectTo =
          storedRedirect || (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // Nettoyage localStorage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.removeItem('code_verifier') // 👈 on le supprime après usage
        localStorage.setItem('isLoggedIn', 'true')

        window.location.replace(redirectTo)
      } catch (e) {
        console.error('❌ [auth/callback ERROR]', e)
        setError(e?.message || 'Erreur de connexion. Veuillez réessayer.')
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
