'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default function TrialProtector({ children }) {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('trial_start, trial_end, is_subscribed')
        .eq('id', user.id)
        .single()

      if (!profile) {
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
      }
    }

    checkAccess()
  }, [])

  return <>{children}</>
}
