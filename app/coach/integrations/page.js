'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/button'

export default function StripeIntegrationPage() {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [accountId, setAccountId] = useState(null)

  useEffect(() => {
    fetchStripeStatus()
  }, [])

  const fetchStripeStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Erreur de lecture Stripe:', error)
      return
    }

    if (data?.stripe_account_id) {
      setConnected(true)
      setAccountId(data.stripe_account_id)
    }
  }

  const handleConnectStripe = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const response = await fetch('/api/stripe/connect', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    if (result.url) {
      window.location.href = result.url
    } else {
      console.error('Erreur lors de la redirection vers Stripe Connect')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Intégration Stripe</h1>
      {connected ? (
        <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded">
          ✅ Votre compte Stripe est connecté : <strong>{accountId}</strong>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-4">
          Vous n'avez pas encore connecté votre compte Stripe.
        </div>
      )}

      <Button onClick={handleConnectStripe} disabled={loading} className="mt-6">
        {loading ? 'Redirection vers Stripe...' : connected ? 'Modifier le compte Stripe' : 'Connecter mon compte Stripe'}
      </Button>
    </div>
  )
}
