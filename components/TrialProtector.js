'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default function TrialProtector({ children }) {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const session = sessionData?.session

        if (!session?.user) {
          router.push('/login')
          return
        }

        const userId = session.user.id

        const { data: profile, error } = await supabase
          .from('users')
          .select('trial_start, trial_end, is_subscribed')
          .eq('id', userId)
          .single()

        if (error || !profile) {
          router.push('/login')
          return
        }

        const now = new Date()
        let trialEnd = null

        if (profile.trial_end) {
          trialEnd = new Date(profile.trial_end)
        } else if (profile.trial_start) {
          const trialStart = new Date(profile.trial_start)
          trialEnd = new Date(trialStart)
          trialEnd.setDate(trialStart.getDate() + 7)
        }

        const isTrialExpired = trialEnd ? now > trialEnd : true
        const isSubscribed = profile.is_subscribed === true

        if (isTrialExpired && !isSubscribed) {
          router.push('/coach/subscribe')
          return
        }

        setLoading(false)
      } catch (err) {
        console.error('Erreur dans TrialProtector:', err)
        router.push('/login')
      }
    }

    checkAccess()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-sm">
        Vérification de l'accès...
      </div>
    )
  }

  return <>{children}</>
}
