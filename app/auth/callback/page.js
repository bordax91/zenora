'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href)
      const search = new URLSearchParams(url.search)

      const oauthError = search.get('error_description') || search.get('error')
      const code = search.get('code')
      const state = search.get('state')

      // ⛔ Erreur OAuth dans l’URL
      if (oauthError) {
        console.error('[OAuth ERROR]', oauthError)
        setError(oauthError)
        return
      }

      // ⛔ Si code ou state manquant, on attend
      if (!code || !state) {
        return
      }

      try {
        // 🌐 Échange du code OAuth pour obtenir une session Supabase
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

        // 🎯 Récupération du rôle depuis localStorage (stocké lors du clic Google)
        const role = localStorage.getItem('pendingRole') || 'client'

        // 🔐 Mise à jour du metadata côté Supabase
        await supabase.auth.updateUser({ data: { role } })

        // 🗓️ Définir les dates d’essai gratuit (7 jours)
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

        // ✅ Détermination de la redirection
        const storedRedirect = localStorage.getItem('pendingRedirect')
        const pick = (path) => path?.startsWith('/') && !path.startsWith('//') ? path : null
        const redirectTo = pick(storedRedirect) || (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

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
