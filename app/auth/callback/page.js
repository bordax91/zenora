'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        const search = new URLSearchParams(window.location.search)
        const code = search.get('code')
        const oauthError = search.get('error_description') || search.get('error')
        if (oauthError) throw new Error(oauthError)

        // 🔄 Échange du code OAuth contre une session Supabase
        if (code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeErr) throw exchangeErr
        }

        // 🔐 Récupérer l'utilisateur connecté
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error('Erreur de connexion. Veuillez réessayer.')
        }
        const user = userData.user

        // 📌 Rôle
        let role = user.user_metadata?.role
        if (!role) {
          role = localStorage.getItem('pendingRole') || 'client'
          await supabase.auth.updateUser({ data: { role } })
        }

        // 📆 Calcul des dates d’essai
        const trialStartDate = new Date()
        const trialEndDate = new Date(trialStartDate)
        trialEndDate.setDate(trialEndDate.getDate() + 7)

        // 🔁 Upsert dans la table 'users'
        const { error: upsertErr } = await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email,
              role,
              trial_start: trialStartDate.toISOString(),
              trial_end: trialEndDate.toISOString(),
              is_subscribed: false,
            },
            { onConflict: 'id' }
          )
        if (upsertErr) throw upsertErr

        // 🧹 Nettoyage
        localStorage.removeItem('pendingRole')
        localStorage.removeItem('pendingRedirect')
        localStorage.removeItem('pendingTrialStart')
        localStorage.setItem('isLoggedIn', 'true')

        // ↪️ Redirection
        const qsRedirect = search.get('redirect') || search.get('next') || ''
        const storedRedirect = localStorage.getItem('pendingRedirect') || ''
        const pick = (path) => (path && path.startsWith('/') && !path.startsWith('//') ? path : null)

        const target =
          pick(qsRedirect) ||
          pick(storedRedirect) ||
          (role === 'coach' ? '/coach/dashboard' : '/client/dashboard')

        router.replace(target)
      } catch (e) {
        console.error('[auth/callback]', e)
        setError(e?.message || 'Erreur de connexion. Veuillez réessayer.')
        router.replace('/login')
      }
    }

    run()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      {error || 'Connexion en cours...'}
    </div>
  )
}
