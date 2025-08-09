'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ReservePage() {
  const search = useSearchParams()
  const router = useRouter()
  const sessionId = search.get('session')
  const [message, setMessage] = useState('Validation de votre réservation…')

  useEffect(() => {
    const run = async () => {
      if (!sessionId) {
        setMessage('Session introuvable.')
        return
      }

      // besoin d’un utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(`/reserve?session=${sessionId}`)}`)
        return
      }

      // sécurise : re-vérifie que la session est dispo
      const { data: rows, error: selErr } = await supabase
        .from('sessions')
        .select('id, statut, payment_link')
        .eq('id', sessionId)
        .limit(1)

      if (selErr || !rows?.length) {
        setMessage('Cette session n’existe pas.')
        return
      }

      const session = rows[0]
      if (session.statut !== 'disponible') {
        setMessage('Désolé, ce créneau n’est plus disponible.')
        return
      }

      // réserve pour ce client
      const { error: updErr } = await supabase
        .from('sessions')
        .update({ statut: 'réservé', client_id: user.id })
        .eq('id', sessionId)

      if (updErr) {
        setMessage('Impossible de réserver ce créneau.')
        return
      }

      // redirection vers Stripe si on a l’URL
      if (session.payment_link) {
        window.location.replace(session.payment_link)
        return
      }

      setMessage('Réservation confirmée. (pas de lien de paiement)')
      // option : router.replace('/client/dashboard')
    }

    run()
  }, [sessionId, router])

  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <p className="text-lg">{message}</p>
    </div>
  )
}
