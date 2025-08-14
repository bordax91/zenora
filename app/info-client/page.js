import { Suspense } from 'react'
import InfoClientPage from './InfoClientPage'

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center py-10">Chargement...</p>}>
      <InfoClientPage />
    </Suspense>
  )
}
