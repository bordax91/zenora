'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        console.log('🔄 [AuthCallback] Début du process...')
        console.log('📌 URL actuelle :', window.location.href)

        // ✅ Ici il faut passer une STRING, pas un objet
        const { data: sessionData, error: exchangeErr } =
          await supabase.auth.exchangeCodeForSession(window.location.href)

        if (exchangeErr) {
          console.error('❌ [exchangeCodeForSession error]', exchangeErr)
          throw exchangeErr
        }

        console.log('✅ Session échangée avec succès !', sessionData)

        // 👤 Récupération utilisateur
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) throw new Error("Impossible de récupérer l’utilisateur.")

        const user = userData.user
        console.log('👤 Utilisateur récupéré :', user)

        // 🎯 Rôle
        const role = localStorage.getItem('pendingRole') || 'client'
        console.log('🎯 Rôle choisi :', role)

        // 🗓️ Période d’essai gratuite
        const trialStart = new Date()
        const trialEnd = new Date(trialStart)
        trialEnd.setDate(trialStart.getDate() + 7)

        // 💾 Upsert dans la table `users`
        const { error: upsertErr } = await supabase.from('users').upsert(
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

        // 🚀 Redirection
        const storedRedirect = localStorage.getItem('pendingRedirect')
        const redirectTo =
          storedRedirect || (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // Nettoyage localStorage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.setItem('isLoggedIn', 'true')

        console.log('➡️ Redirection vers :', redirectTo)
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
