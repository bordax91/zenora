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

        if (code) {
          const { error: exchangeErr } =
            await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeErr) throw exchangeErr
        }

        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr || !userData?.user) {
          throw new Error('Erreur de connexion. Veuillez réessayer.')
        }
        const user = userData.user

        let role = user.user_metadata?.role
        if (!role) {
          role = localStorage.getItem('pendingRole') || 'client'
          await supabase.auth.updateUser({ data: { role } })
        }

        await supabase
          .from('users')
          .upsert({ id: user.id, email: user.email, role }, { onConflict: 'id' })

        localStorage.removeItem('pendingRole')
        localStorage.setItem('isLoggedIn', 'true')

        const qsRedirect = search.get('redirect') || search.get('next') || ''
        const storedRedirect = localStorage.getItem('pendingRedirect') || ''
        localStorage.removeItem('pendingRedirect')

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
