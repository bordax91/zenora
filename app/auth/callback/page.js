'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const processUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        router.push('/login')
        return
      }

      const user = data.user
      let role = user.user_metadata?.role

      // Si pas de rôle enregistré (cas Google), on prend celui dans localStorage
      if (!role) {
        role = localStorage.getItem('pendingRole') || 'client'

        // On met à jour user_metadata dans Supabase
        await supabase.auth.updateUser({ data: { role } })

        // On insère dans la table 'users'
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          role,
          created_at: new Date().toISOString(),
        })
      }

      localStorage.removeItem('pendingRole')
      localStorage.setItem('isLoggedIn', 'true')

      router.push(role === 'coach' ? '/coach/dashboard' : '/client/dashboard')
    }

    processUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Connexion en cours...
    </div>
  )
}
