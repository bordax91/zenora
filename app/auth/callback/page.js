'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href)
        const search = new URLSearchParams(url.search)

        const oauthError = search.get('error_description') || search.get('error')
        const code = search.get('code')
        const state = search.get('state')

        // ⛔ Erreur OAuth détectée
        if (oauthError) {
          console.error('[OAuth ERROR]', oauthError)
          setError(oauthError)
          return
        }

        // ⛔ On attend que code + state soient présents
        if (!code || !state) return

        // 🌐 Échange du code OAuth contre une session Supabase
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (exchangeErr) {
          console.error('[exchangeCodeForSession error]', exchangeErr)
          throw exchangeErr
        }

        // 👤 Récupération de l’utilisateur connecté
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error('Impossible de récupérer l’utilisateur.')
        }

        const user = userData.user

        // 🎯 Lecture du rôle et de la redirection depuis localStorage ou state
        let role = localStorage.getItem('pendingRole') || 'client'
        let redirectTo = localStorage.getItem('pendingRedirect') || (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // ✅ Si state est présent et encodé en JSON (optionnel)
        if (state) {
          try {
            const decodedState = JSON.parse(atob(state.split('.')[1])) // si JWT
            role = decodedState.role || role
            redirectTo = decodedState.redirect || redirectTo
          } catch (err) {
            console.warn('State non décodable, utilisation de localStorage :', err)
          }
        }

        // 🔐 Mise à jour du metadata côté Supabase
        await supabase.auth.updateUser({ data: { role } })

        // 🗓️ Dates d’essai gratuit (7 jours)
        const trialStart = new Date()
        const trialEnd = new Date(trialStart)
        trialEnd.setDate(trialStart.getDate() + 7)

        // 💾 Upsert dans la table `users`
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

        if (upsertErr) {
          console.error('[upsert error]', upsertErr)
          throw upsertErr
        }

        // 🧹 Nettoyage du localStorage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.setItem('isLoggedIn', 'true')

        console.log('✅ Redirection vers :', redirectTo)

        // 🚀 Redirection manuelle
        window.location.replace(redirectTo)

      } catch (e) {
        console.error('[auth/callback ERROR]', e)
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
