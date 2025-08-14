'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { packageId } = useParams()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const startCheckout = async () => {
      try {
        const res = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId, sessionId })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.message || 'Erreur de redirection')
        }

        window.location.href = data.url // redirige vers Stripe Checkout
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    if (packageId && sessionId) {
      startCheckout()
    } else {
      setError('Paramètres manquants.')
      setLoading(false)
    }
  }, [packageId, sessionId])

  if (loading) {
    return <p className="text-center py-20">Redirection vers Stripe...</p>
  }

  return (
    <div className="text-center py-20 text-red-500">
      {error ? `Erreur : ${error}` : 'Une erreur inconnue est survenue.'}
    </div>
  )
}
