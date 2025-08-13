'use client'

import { Suspense } from 'react'
import RegisterPageInner from './RegisterPageInner'

export default function RegisterPageClient() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <RegisterPageInner />
    </Suspense>
  )
}
