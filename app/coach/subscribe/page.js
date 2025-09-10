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
            setPriceLabel('Mensuel – 39€/mois')
          } else if (priceId === STRIPE_YEARLY) {
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
  const trialEnd = user.trial_end ? new Date(user.trial_end) : null
  const isTrialActive = trialEnd && now < trialEnd
  const isPendingCancel = user.cancel_at_period_end === true
  const isSubscribed = user.is_subscribed === true

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Votre abonnement Zenora</h1>

      {/* ✅ Bloc statut */}
      {isSubscribed && !isPendingCancel && (
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
      )}

      {isSubscribed && isPendingCancel && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
          ⚠️ Votre abonnement est actif, mais sera résilié à la fin de la période actuelle.
          {priceLabel && <p className="mt-2 font-medium">Plan : {priceLabel}</p>}
        </div>
      )}

      {!isSubscribed && isTrialActive && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-6">
          ⏳ Vous êtes en période d’essai jusqu’au <strong>{trialEnd.toLocaleDateString()}</strong>.
        </div>
      )}

      {!isSubscribed && !isTrialActive && !isPendingCancel && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          ❌ Votre période d’essai est terminée. Veuillez souscrire à une offre pour continuer.
        </div>
      )}

      {/* ✨ Fonctionnalités Zenora */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Fonctionnalités incluses avec votre abonnement</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✅ <strong>Page publique personnalisée</strong> pour présenter vos offres de coaching</li>
          <li>🤖 <strong>Outil de prospection IA</strong> pour trouver de nouveaux clients automatiquement</li>
          <li>📈 <strong>Suivi des ventes</strong> et des rendez-vous en temps réel</li>
          <li>🛍️ <strong>Création d'offres</strong> illimitée avec durée, prix et description</li>
          <li>📆 <strong>Prise de rendez-vous simplifiée</strong> avec calendrier intelligent</li>
          <li>📝 <strong>Notes privées</strong> sur vos clients pour mieux les suivre</li>
          <li>💳 <strong>Paiement sécurisé</strong> via Stripe (vous recevez directement l'argent)</li>
        </ul>
      </div>

      {/* 🛒 CTA abonnement */}
      {(!isSubscribed || isPendingCancel) && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSubscribe(STRIPE_MONTHLY)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🔁 S’abonner au plan mensuel – 39€/mois
          </button>
          <button
            onClick={() => handleSubscribe(STRIPE_YEARLY)}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            📅 S’abonner au plan annuel – 349€/an
          </button>
        </div>
      )}
    </div>
  )
}
