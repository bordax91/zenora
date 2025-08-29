'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'

export default function UserProviderWrapper({ children }) {
  return <SessionContextProvider>{children}</SessionContextProvider>
}
