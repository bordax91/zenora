'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      const search = new URLSearchParams(window.location.search)
      const oauthError = search.get('error_description') || search.get('error')

      if (oauthError) {
        setError(oauthError)
        return
      }

      try {
        // 🌐 Échange le code d'auth avec Supabase pour obtenir une session
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (exchangeErr) {
          console.error('[exchangeCodeForSession error]', exchangeErr)
          throw exchangeErr
        }

        // 👤 Récupération de l'utilisateur connecté
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error('Impossible de récupérer l’utilisateur.')
        }

        const user = userData.user

        // 🔐 Récupération ou définition du rôle depuis localStorage
        let role = user.user_metadata?.role
        if (!role) {
          role = localStorage.getItem('pendingRole') || 'client'
          await supabase.auth.updateUser({ data: { role } })
        }

        // 🗓️ Définir les dates d’essai gratuit (7 jours)
        const trialStart = new Date()
        const trialEnd = new Date(trialStart)
        trialEnd.setDate(trialStart.getDate() + 7)

        // 💾 Upsert dans la table "users"
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

        // 🧹 Nettoyage localStorage
        const storedRedirect = localStorage.getItem('pendingRedirect') || ''
        const pick = (path) => path?.startsWith('/') && !path.startsWith('//') ? path : null
        const redirectTo =
          pick(storedRedirect) ||
          (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.removeItem('pendingTrialEnd')
        localStorage.setItem('isLoggedIn', 'true')

        console.log('✅ Redirection vers :', redirectTo)
        router.replace(redirectTo)

      } catch (e) {
        console.error('[auth/callback ERROR]', e)
        setError(e?.message || 'Erreur de connexion. Veuillez réessayer.')
      }
    }

    run()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600 text-center px-4">
      {error || 'Connexion en cours...'}
    </div>
  )
}
