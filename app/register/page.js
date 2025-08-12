export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import RegisterPageClient from './RegisterPageClient'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <RegisterPageClient />
    </Suspense>
  )
}
