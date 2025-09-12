'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        console.log('🔄 [AuthCallback] Début du process...')

        const url = new URL(window.location.href)
        console.log('📌 URL complète reçue :', url.toString())

        const search = new URLSearchParams(url.search)
        const oauthError = search.get('error_description') || search.get('error')
        const code = search.get('code')
        const state = search.get('state')

        console.log('📌 Query params -> code:', code, 'state:', state)

        // ⛔ Erreur OAuth détectée
        if (oauthError) {
          console.error('❌ [OAuth ERROR]', oauthError)
          setError(oauthError)
          return
        }

        // ⛔ Pas de code/state → inutile de continuer
        if (!code || !state) {
          console.warn('⚠️ Pas de code ou state trouvé, arrêt.')
          return
        }

        // 🌐 Échange du code OAuth contre une session Supabase
        console.log('🔑 [AuthCallback] Tentative échange code → session Supabase...')
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (exchangeErr) {
          console.error('❌ [exchangeCodeForSession error]', exchangeErr)
          throw exchangeErr
        }
        console.log('✅ Session échangée avec succès !')

        // 👤 Récupération de l’utilisateur
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          console.error('❌ [getUser error]', userErr)
          throw new Error("Impossible de récupérer l’utilisateur.")
        }

        const user = userData.user
        console.log('👤 Utilisateur récupéré :', user)

        // 🎯 Rôle depuis localStorage (ou fallback client)
        const role = localStorage.getItem('pendingRole') || 'client'
        console.log('🎯 Rôle trouvé :', role)

        // 🔐 Mise à jour metadata côté Supabase
        console.log('✏️ Mise à jour du metadata utilisateur...')
        await supabase.auth.updateUser({ data: { role } })
        console.log('✅ Metadata mis à jour')

        // 🗓️ Période d’essai gratuite (7 jours)
        const trialStart = new Date()
        const trialEnd = new Date(trialStart)
        trialEnd.setDate(trialStart.getDate() + 7)

        console.log('🗓️ Période d’essai :', trialStart.toISOString(), '→', trialEnd.toISOString())

        // 💾 Insertion/màj dans `users`
        console.log('💾 Upsert dans la table users...')
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
          console.error('❌ [upsert error]', upsertErr)
          throw upsertErr
        }
        console.log('✅ Utilisateur inséré/mis à jour dans users')

        // ✅ Détermination de la redirection
        const storedRedirect = localStorage.getItem('pendingRedirect')
        const isSafePath = (path) => path?.startsWith('/') && !path.startsWith('//')
        const redirectTo =
          (storedRedirect && isSafePath(storedRedirect) && storedRedirect) ||
          (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        console.log('➡️ Redirection prévue vers :', redirectTo)

        // 🧹 Nettoyage localStorage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.setItem('isLoggedIn', 'true')

        // 🚀 Redirection manuelle
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
