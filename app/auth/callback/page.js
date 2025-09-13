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

        // 👤 Récupération utilisateur via Supabase
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          throw error || new Error("Impossible de récupérer l’utilisateur.")
        }

        console.log('✅ Utilisateur récupéré :', user)

        // 🎯 Détermination du rôle
        const role =
          localStorage.getItem('pendingRole') ||         // si défini via register
          user.user_metadata?.role ||                   // si déjà en metadata
          'coach'                                       // par défaut Google → coach

        // 🚀 Redirection après login
        const redirectTo =
          localStorage.getItem('pendingRedirect') ||
          (role === 'coach' ? '/coach/onboarding' : '/client/dashboard')

        // 🔍 Vérifier si l'utilisateur existe déjà dans la table
        const { data: existingUser, error: fetchErr } = await supabase
          .from('users')
          .select('id, trial_start, trial_end, is_subscribed')
          .eq('id', user.id)
          .maybeSingle()

        if (fetchErr) throw fetchErr

        let trialStart = existingUser?.trial_start
        let trialEnd = existingUser?.trial_end

        // Si aucun essai enregistré → créer période de 7 jours
        if (!trialStart || !trialEnd) {
          trialStart =
            localStorage.getItem('pendingTrialStart') ||
            new Date().toISOString()
          trialEnd =
            localStorage.getItem('pendingTrialEnd') ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }

        // ⚡ Upsert dans la table `users`
        const { error: upsertErr } = await supabase.from('users').upsert(
          {
            id: user.id,
            email: user.email,
            role,
            trial_start: trialStart,
            trial_end: trialEnd,
            is_subscribed: existingUser?.is_subscribed || false,
          },
          { onConflict: 'id' }
        )
        if (upsertErr) throw upsertErr

        console.log('✅ Utilisateur inséré/mis à jour dans users')

        // 📧 Envoi email de bienvenue uniquement pour les coachs nouveaux
        if (role === 'coach' && !existingUser) {
          try {
            await fetch('/api/emails/send-welcome-coach-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: user.email }),
            })
            console.log('📧 Email de bienvenue envoyé')
          } catch (err) {
            console.warn('⚠️ Envoi email échoué (non bloquant)', err)
          }
        }

        // ✅ Nettoyage du localStorage
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
