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

        // 👤 Récupération utilisateur via PKCE
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          throw error || new Error("Impossible de récupérer l’utilisateur.")
        }

        console.log('✅ Utilisateur récupéré :', user)

        // 🎯 Récup rôle et essai depuis localStorage
        const role = localStorage.getItem('pendingRole') || 'client'
        const trialStart = localStorage.getItem('pendingTrialStart')
        const trialEnd = localStorage.getItem('pendingTrialEnd')
        const redirectTo =
          localStorage.getItem('pendingRedirect') ||
          (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // ⚡ Upsert dans la table `users`
        const { error: upsertErr } = await supabase.from('users').upsert(
          {
            id: user.id,
            email: user.email,
            role,
            trial_start: trialStart || new Date().toISOString(),
            trial_end:
              trialEnd ||
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_subscribed: false,
          },
          { onConflict: 'id' }
        )
        if (upsertErr) throw upsertErr

        // 📧 Email de bienvenue
        try {
          await fetch('/api/emails/send-welcome-coach-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: user.email }),
          })
        } catch (err) {
          console.warn('⚠️ Envoi email échoué (non bloquant)', err)
        }

        // ✅ Nettoyage localStorage
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
