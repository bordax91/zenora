'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    const processUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        setError('Erreur de connexion. Veuillez réessayer.')
        router.push('/login')
        return
      }

      const user = data.user
      let role = user.user_metadata?.role

      // Si pas de rôle défini, on essaie localStorage
      if (!role) {
        role = localStorage.getItem('pendingRole') || 'client'

        // 🔁 Mise à jour user_metadata
        await supabase.auth.updateUser({ data: { role } })

        // 🔎 Vérifie si déjà dans la table "users"
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existing) {
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            role,
            created_at: new Date().toISOString(),
          })
        }
      }

      localStorage.removeItem('pendingRole')
      localStorage.setItem('isLoggedIn', 'true')

      router.push(role === 'coach' ? '/coach/dashboard' : '/client/dashboard')
    }

    processUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      {error || 'Connexion en cours...'}
    </div>
  )
}
