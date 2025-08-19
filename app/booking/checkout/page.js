import { Suspense } from 'react'
import CheckoutRedirect from '@/components/CheckoutRedirect'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="text-center py-20">Chargement...</p>}>
      <CheckoutRedirect />
    </Suspense>
  )
}
