'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function CheckoutPage() {
  const params = useParams()
  const packageId = params?.packageId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const startCheckout = async () => {
      try {
        const res = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error || 'Erreur de redirection')
        }

        window.location.href = data.url
      } catch (err) {
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
