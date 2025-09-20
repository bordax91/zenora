'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AbonnementPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [priceLabel, setPriceLabel] = useState(null)

  const STRIPE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
  const STRIPE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY

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
          if (priceId === STRIPE_MONTHLY) {
            setPriceLabel('Mensuel – 29€/mois')
          } else if (priceId === STRIPE_YEARLY) {
            setPriceLabel('Annuel – 290€/an')
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
    const confirmed = confirm("Souhaitez-vous vraiment vous désabonner à la fin de la période ?")
    if (!confirmed) return

    const res = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: user.stripe_customer_id })
    })

    const result = await res.json()
    if (result.success) {
      alert('Votre abonnement sera résilié à la fin de la période en cours.')
      location.reload()
    } else {
      alert('Erreur lors de la demande de désabonnement.')
      console.error(result.error)
    }
  }

  const handleSubscribe = async (priceId) => {
    const res = await fetch('/api/stripe/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, priceId })
    })
    const result = await res.json()
    if (result?.url) {
      window.location.href = result.url
    } else {
      alert('Erreur de redirection vers Stripe.')
    }
  }

  if (loading) return <div className="p-6">Chargement...</div>
  if (!user) return <div className="p-6">Utilisateur non trouvé.</div>

  const now = new Date()
  const trialEnd = user.trial_end ? new Date(user.trial_end) : null
  const isTrialActive = trialEnd && now < trialEnd
  const isPendingCancel = user.cancel_at_period_end === true
  const isSubscribed = user.is_subscribed === true

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Choisissez votre abonnement</h1>

      {/* Période d’essai */}
      {isTrialActive && (
        <div className="mb-6 bg-yellow-100 text-yellow-900 p-4 rounded text-center">
          ⏳ Vous êtes en période d’essai jusqu’au <strong>{trialEnd.toLocaleDateString()}</strong>.
        </div>
      )}

      {/* Abonnement inactif */}
      {!isSubscribed && !isTrialActive && !isPendingCancel && (
        <div className="mb-6 bg-red-100 text-red-900 p-4 rounded text-center">
          ❌ Votre période d’essai est terminée. Veuillez souscrire à une offre pour continuer.
        </div>
      )}

      {/* Plans d'abonnement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plan Starter */}
        <div className="border rounded-xl shadow p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Starter</h2>
            <p className="text-gray-600 mb-4">Idéal pour les coachs qui démarrent</p>
            <p className="text-3xl font-bold">29€<span className="text-base font-normal">/mois</span></p>
            {priceLabel?.includes("29") && isSubscribed && (
              <span className="text-green-700 font-semibold">✅ Abonnement actif</span>
            )}
            {priceLabel?.includes("29") && isPendingCancel && (
              <span className="text-yellow-600 font-semibold">⏳ Résiliation en attente</span>
            )}
            <ul className="mt-6 space-y-2 text-gray-700">
              <li>✅ Outil de prospection IA</li>
              <li>✅ Suivi des ventes et rendez-vous</li>
              <li>✅ Page publique personnalisée</li>
              <li>✅ Prise de RDV avec calendrier</li>
              <li>✅ Paiement sécurisé par Stripe</li>
              <li>✅ Création d’offres coaching</li>
              <li>✅ Notes sur vos clients</li>
            </ul>
          </div>
          <div className="mt-6">
            <button
              onClick={() => handleSubscribe(STRIPE_MONTHLY)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Choisir le plan Starter
            </button>
          </div>
        </div>

        {/* Plan Premium */}
        <div className="border-4 border-indigo-500 rounded-xl shadow-lg p-6 flex flex-col justify-between bg-indigo-50">
          <div>
            <h2 className="text-2xl font-bold mb-2">Premium</h2>
            <p className="text-gray-600 mb-4">Accès complet à toutes les fonctionnalités</p>
            <p className="text-3xl font-bold">290€<span className="text-base font-normal">/an</span></p>
            {priceLabel?.includes("290") && isSubscribed && (
              <span className="text-green-700 font-semibold">✅ Abonnement actif</span>
            )}
            {priceLabel?.includes("290") && isPendingCancel && (
              <span className="text-yellow-600 font-semibold">⏳ Résiliation en attente</span>
            )}
            <ul className="mt-6 space-y-2 text-gray-700">
              <li>✅ Outil de prospection IA</li>
              <li>✅ Suivi des ventes et rendez-vous</li>
              <li>✅ Page publique personnalisée</li>
              <li>✅ Prise de RDV avec calendrier</li>
              <li>✅ Paiement sécurisé par Stripe</li>
              <li>✅ Création d’offres coaching</li>
              <li>✅ Notes sur vos clients</li>
            </ul>
          </div>
          <div className="mt-6">
            <button
              onClick={() => handleSubscribe(STRIPE_YEARLY)}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Choisir le plan Premium
            </button>
          </div>
        </div>
      </div>

      {/* Désabonnement possible */}
      {isSubscribed && !isPendingCancel && (
        <div className="mt-10 text-center">
          <button
            onClick={handleUnsubscribe}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Se désabonner
          </button>
        </div>
      )}
    </div>
  )
}
