'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import LoginInline from './LoginInline'

export default function AuthOverlay() {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
      setReady(true)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub?.subscription?.unsubscribe?.()
  }, [])

  if (!ready || user) return null

  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <LoginInline redirect={pathname} />
      </div>
    </div>
  )
}
