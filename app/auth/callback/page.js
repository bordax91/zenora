'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const search = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        // 1) Échange du code OAuth -> session
        const code = search.get('code')
        const oauthError = search.get('error_description') || search.get('error')
        if (oauthError) throw new Error(oauthError)

        if (code) {
          const { error: exchangeErr } =
            await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeErr) throw exchangeErr
        }

        // 2) Récupérer l’utilisateur
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error('Erreur de connexion. Veuillez réessayer.')
        }
        const user = userData.user

        // 3) Rôle: user_metadata.role -> sinon pendingRole -> sinon client
        let role = (user.user_metadata as any)?.role as string | undefined
        if (!role) {
          role = localStorage.getItem('pendingRole') || 'client'
          await supabase.auth.updateUser({ data: { role } })
        }

        // 4) Upsert idempotent dans "users"
        await supabase
          .from('users')
          .upsert(
            { id: user.id, email: user.email, role },
            { onConflict: 'id' }
          )

        // 5) Nettoyage localStorage, flag login
        localStorage.removeItem('pendingRole')
        localStorage.setItem('isLoggedIn', 'true')

        // 6) Résolution de la destination
        //    priorité: ?redirect=... > ?next=... > pendingRedirect > dashboard par rôle
        const qsRedirect = search.get('redirect') || search.get('next') || ''
        const storedRedirect = localStorage.getItem('pendingRedirect') || ''
        localStorage.removeItem('pendingRedirect')

        const pick = (path?: string | null) =>
          path && path.startsWith('/') ? path : null

        const target =
          pick(qsRedirect) ||
          pick(storedRedirect) ||
          (role === 'coach' ? '/coach/dashboard' : '/client/dashboard')

        router.replace(target)
      } catch (e: any) {
        console.error('[auth/callback]', e)
        setError(e?.message || 'Erreur de connexion. Veuillez réessayer.')
        router.replace('/login')
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      {error || 'Connexion en cours...'}
    </div>
  )
}
