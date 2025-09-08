'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AbonnementPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [priceLabel, setPriceLabel] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser(profile)

      if (profile?.stripe_customer_id) {
        const { data: subscriptions } = await fetchStripeSubscription(profile.stripe_customer_id)
        if (subscriptions?.data?.length) {
          const priceId = subscriptions.data[0]?.items?.data[0]?.price?.id

          const monthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
          const yearlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY
          const testMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST_MONTHLY

          if (priceId === monthlyId) {
            setPriceLabel('Mensuel – 39€/mois')
          } else if (priceId === yearlyId) {
            setPriceLabel('Annuel – 349€/an')
          } else if (priceId === testMonthlyId) {
            setPriceLabel('Test – 1€/mois')
          } else {
            setPriceLabel('Abonnement actif')
          }
        }
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  const fetchStripeSubscription = async (customerId) => {
    try {
      const res = await fetch(`/api/stripe/get-subscription?customerId=${customerId}`)
      return await res.json()
    } catch (err) {
      console.error('Erreur récupération abonnement Stripe :', err)
      return {}
    }
  }

  const handleUnsubscribe = async () => {
    const confirmed = confirm("Souhaitez-vous vraiment vous désabonner ?")
    if (!confirmed) return

    const res = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: user.stripe_customer_id })
    })

    const result = await res.json()
    if (result.success) {
      alert('Vous avez été désabonné.')
      location.reload()
    } else {
      alert('Erreur lors du désabonnement.')
      console.error(result.error)
    }
  }

  const handleSubscribe = async (priceId) => {
    try {
      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          priceId
        })
      })

      const result = await res.json()
      if (result?.url) {
        window.location.href = result.url
      } else {
        alert('Erreur de redirection vers Stripe.')
        console.error(result.error)
      }
    } catch (err) {
      console.error('Erreur abonnement Stripe :', err)
    }
  }

  if (loading) return <div className="p-6">Chargement...</div>
  if (!user) return <div className="p-6">Utilisateur non trouvé.</div>

  const now = new Date()
  const trialEnd = new Date(user.trial_end)
  const isTrialActive = now < trialEnd

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Abonnement</h1>

      {user.is_subscribed ? (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
          ✅ Vous êtes actuellement abonné(e).
          {priceLabel && <p className="mt-2 font-medium">Plan : {priceLabel}</p>}
          <button
            onClick={handleUnsubscribe}
            className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Se désabonner
          </button>
        </div>
      ) : isTrialActive ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
          ⏳ Vous êtes en période d’essai jusqu’au <strong>{trialEnd.toLocaleDateString()}</strong>.
        </div>
      ) : (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          ❌ Votre période d’essai est terminée. Veuillez souscrire à une offre pour continuer.
        </div>
      )}

      {!user.is_subscribed && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🔁 S’abonner au plan mensuel – 39€/mois
          </button>
          <button
            onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY)}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            📅 S’abonner au plan annuel – 349€/an
          </button>
          <button
            onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST_MONTHLY)}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            🧪 Plan test – 1€/mois
          </button>
        </div>
      )}
    </div>
  )
}
