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
        console.log('🔄 [AuthCallback] Début du process...')

        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        )

        if (error) throw error
        console.log('✅ Session échangée', data)

        router.replace('/coach/dashboard')
      } catch (err) {
        console.error('❌ [AuthCallback ERROR]', err)
        setError(err.message)
      }
    }
    run()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <p className="text-red-600">Erreur : {error}</p>
      ) : (
        <p>Connexion en cours...</p>
      )}
    </div>
  )
}
