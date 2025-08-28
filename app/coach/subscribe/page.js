'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

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

          if (priceId === monthlyId) {
            setPriceLabel('Mensuel – 39€/mois')
          } else if (priceId === yearlyId) {
            setPriceLabel('Annuel – 349€/an')
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

    const { error } = await supabase
      .from('users')
      .update({ is_subscribed: false })
      .eq('id', user.id)

    if (!error) {
      alert('Vous êtes désabonné.')
      location.reload()
    }
  }

  if (loading) return <div className="p-6">Chargement...</div>
  if (!user) return <div className="p-6">Utilisateur non trouvé.</div>

  const now = new Date()
  const trialEnd = new Date(user.trial_end)
  const isTrialActive = now < trialEnd

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Abonnement</h1>

      {user.is_subscribed ? (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
          ✅ Vous êtes actuellement abonné(e).
          {priceLabel && <p className="mt-2 font-medium">Plan : {priceLabel}</p>}
          <button
            onClick={handleUnsubscribe}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Se désabonner
          </button>
        </div>
      ) : isTrialActive ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
          ⏳ Vous êtes en période d’essai jusqu’au <strong>{trialEnd.toLocaleDateString()}</strong>.
        </div>
      ) : (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          ❌ Votre période d’essai est terminée. Veuillez souscrire à une offre pour continuer.
        </div>
      )}

      {!user.is_subscribed && (
        <div className="space-y-4 mt-4">
          <Link href="https://buy.stripe.com/link_mensuel" target="_blank">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              🔁 S’abonner au plan mensuel – 39€/mois
            </button>
          </Link>
          <Link href="https://buy.stripe.com/lien_annuel" target="_blank">
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              📅 S’abonner au plan annuel – 349€/an
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
