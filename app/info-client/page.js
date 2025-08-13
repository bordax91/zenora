'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function InfoClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?next=/info-client?session=${sessionId}`)
      } else {
        setUser(user)
      }
    }
    checkAuth()
  }, [sessionId, router])

  const handleConfirm = async () => {
    // 👇 Ici, tu peux récupérer les infos saisies dans un formulaire
    // et appeler Stripe Checkout :
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ sessionId }), // ou priceId, selon ta logique
      headers: { 'Content-Type': 'application/json' }
    })

    const result = await response.json()
    window.location.href = result.url
  }

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Informations client</h1>
      {/* Ton formulaire ici */}
      <button onClick={handleConfirm} className="bg-blue-600 text-white px-4 py-2 rounded">
        Confirmer et payer
      </button>
    </div>
  )
}
