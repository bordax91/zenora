'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TarifsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const STRIPE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
  const STRIPE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser(profile)
      setLoading(false)
    }

    fetchProfile()
  }, [])

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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Abonnement Zenora</h1>

      {user?.is_subscribed ? (
        <div className="bg-green-100 text-green-800 px-6 py-4 rounded text-center font-semibold">
          ✅ Vous êtes déjà abonné(e) à Zenora !
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Plan Mensuel */}
            <div className="border p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-2">Plan Mensuel</h2>
              <p className="text-gray-600 mb-4">💳 39€/mois, sans engagement</p>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>🤖 Outil de prospection IA</li>
                <li>📈 Suivi des ventes et rendez-vous</li>
                <li>🌐 Page publique personnalisée</li>
                <li>📅 Prise de RDV avec calendrier</li>
                <li>💳 Paiement sécurisé par Stripe</li>
                <li>🧾 Création d’offres coaching</li>
                <li>📝 Notes sur vos clients</li>
              </ul>
              <button
                onClick={() => handleSubscribe(STRIPE_MONTHLY)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                disabled={!user}
              >
                Choisir ce plan
              </button>
            </div>

            {/* Plan Annuel */}
            <div className="border p-6 rounded-2xl shadow hover:shadow-lg transition bg-gray-50 border-2 border-indigo-500">
              <h2 className="text-2xl font-semibold mb-2">Plan Annuel</h2>
              <p className="text-gray-600 mb-4">📅 349€/an (soit 2 mois offerts)</p>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>🤖 Outil de prospection IA</li>
                <li>📈 Suivi des ventes et rendez-vous</li>
                <li>🌐 Page publique personnalisée</li>
                <li>📅 Prise de RDV avec calendrier</li>
                <li>💳 Paiement sécurisé par Stripe</li>
                <li>🧾 Création d’offres coaching</li>
                <li>📝 Notes sur vos clients</li>
              </ul>
              <button
                onClick={() => handleSubscribe(STRIPE_YEARLY)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                disabled={!user}
              >
                Choisir ce plan
              </button>
            </div>
          </div>

          <div className="text-center text-gray-600 text-sm">
            Tous les abonnements donnent un accès complet à toutes les fonctionnalités de Zenora.
          </div>
        </>
      )}
    </div>
  )
}
