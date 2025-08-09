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
        // 1) Gérer le retour OAuth (PKCE) : échanger le code contre une session
        const code = search.get('code')
        const nextParam = search.get('next') || ''

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeError) throw exchangeError
        }

        // 2) Récupérer l'utilisateur
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error('Erreur de connexion. Veuillez réessayer.')
        }

        const user = userData.user

        // 3) S’assurer que le rôle est bien défini (par défaut "client")
        let role = user.user_metadata?.role as string | undefined
        if (!role) {
          role = localStorage.getItem('pendingRole') || 'client'
          await supabase.auth.updateUser({ data: { role } })
        }

        // 4) Upsert dans la table "users" (idempotent)
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          role,
          // si created_at géré par défaut, on peut l’omettre
        }, { onConflict: 'id' })

        localStorage.removeItem('pendingRole')
        localStorage.setItem('isLoggedIn', 'true')

        // 5) Redirection : priorité à `next=...`, sinon dashboard par rôle
        if (nextParam && nextParam.startsWith('/')) {
          router.replace(nextParam)
        } else {
          router.replace(role === 'coach' ? '/coach/dashboard' : '/client/dashboard')
        }
      } catch (e: any) {
        console.error(e)
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
