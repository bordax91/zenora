'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Import dynamique avec désactivation du SSR
const CreatePackageForm = dynamic(() => import('@/components/coach/CreatePackageForm'), {
  ssr: false,
  loading: () => <p className="text-center mt-10">Chargement du formulaire...</p>,
})

export default function Page() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <p className="text-center mt-10">Chargement de la page...</p>
  }

  return <CreatePackageForm />
}
