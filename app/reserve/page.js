'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ReservePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = useMemo(() => searchParams.get('sessionId'), [searchParams])
  const [status, setStatus] = useState('Vérification…')

  useEffect(() => {
    const run = async () => {
      if (!sessionId) {
        setStatus('Paramètre sessionId manquant.')
        return
      }

      // 1) Auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const nextUrl = encodeURIComponent(`/reserve?sessionId=${sessionId}`)
        window.location.href = `/login?next=${nextUrl}`
        return
      }

      setStatus('Réservation en cours…')

      // 2) Réserver la session (statut doit être "disponible")
      const { data, error } = await supabase
        .from('sessions')
        .update({
          client_id: user.id,
          statut: 'réservé'
        })
        .eq('id', sessionId)
        .eq('statut', 'disponible')
        .select('payment_link')
        .single()

      if (error) {
        console.error('❌ Update error:', error)
        setStatus("Impossible de réserver ce créneau (il n'est peut-être plus disponible).")
        return
      }

      // 3) Redirection Stripe
      if (data?.payment_link) {
        setStatus('Redirection vers Stripe…')
        window.location.href = data.payment_link
      } else {
        setStatus('Réservation confirmée ✅')
        setTimeout(() => router.push('/client/dashboard'), 1200)
      }
    }

    run()
  }, [sessionId, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  )
}
