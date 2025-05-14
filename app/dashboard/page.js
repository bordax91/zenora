'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        router.push('/login')
      } else {
        router.push(data.role === 'coach' ? '/coach/dashboard' : '/client/dashboard')
      }
    }

    redirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Redirection en cours...
    </div>
  )
}
