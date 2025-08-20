'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CheckoutRedirect() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')
  const sessionId = searchParams.get('session')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const startCheckout = async () => {
      try {
        // 🔐 Récupère l'utilisateur connecté
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          throw new Error('Utilisateur non connecté')
        }

        const clientId = user.id

        console.log('📦 Données envoyées :', { packageId, sessionId, clientId })

        const res = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId,
            sessionId,
            clientId,
          }),
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
