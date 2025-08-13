'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function BookingPage() {
  const { packageId } = useParams()
  const router = useRouter()
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackage = async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single()
      if (error) {
        console.error('Erreur récupération package:', error)
      } else {
        setPkg(data)
      }
      setLoading(false)
    }
    fetchPackage()
  }, [packageId])

  const handleCheckout = async () => {
    const stripe = await stripePromise
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: pkg.stripe_price_id })
    })
    const session = await response.json()
    await stripe.redirectToCheckout({ sessionId: session.id })
  }

  if (loading) return <p className="text-center py-10">Chargement...</p>
  if (!pkg) return <p className="text-center py-10 text-red-500">Offre introuvable.</p>

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{pkg.title}</h1>
      <p className="mb-2 text-gray-700">{pkg.description}</p>
      <p className="mb-6 font-semibold text-lg">Prix : {pkg.price}€</p>
      <Button onClick={handleCheckout}>Payer et réserver</Button>
    </div>
  )
}
