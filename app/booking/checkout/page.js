'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const startCheckout = async () => {
      try {
        console.log('📦 packageId reçu pour checkout :', packageId)

        const res = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId })
        })

        const data = await res.json()
        console.log('📥 Réponse API /checkout-session :', data)

        if (!res.ok) {
          throw new Error(data?.error || 'Erreur de redirection')
        }

        // Redirection vers Stripe Checkout
        window.location.href = data.url
      } catch (err) {
        console.error('❌ Erreur checkout :', err.message)
        setError(err.message)
        setLoading(false)
      }
    }

    if (packageId) {
      startCheckout()
    } else {
      setError('Package ID manquant.')
      setLoading(false)
    }
  }, [packageId])

  if (loading) {
    return <p className="text-center py-20">Redirection vers Stripe...</p>
  }

  return (
    <div className="text-center py-20 text-red-500">
      {error ? `Erreur : ${error}` : 'Une erreur inconnue est survenue.'}
    </div>
  )
}
