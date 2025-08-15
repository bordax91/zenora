'use client'

import dynamic from 'next/dynamic'

// Empêche le rendu côté serveur
const CreatePackageForm = dynamic(() => import('@/components/coach/CreatePackageForm'), {
  ssr: false,
})

export default function Page() {
  return <CreatePackageForm />
}
