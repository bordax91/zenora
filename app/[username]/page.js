'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import CoachCalendar from '@/components/CoachCalendar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachProfilePage() {
  const { username } = useParams()
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) fetchCoach()
  }, [username])

  const fetchCoach = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'coach')
      .single()

    if (error) console.error('Erreur récupération coach:', error)
    else setCoach(data)
    setLoading(false)
  }

  if (loading) return <p className="text-center py-10">Chargement...</p>
  if (!coach) return <p className="text-center py-10 text-red-500">Coach introuvable.</p>

  return (
    <div className="max-w-5xl mx-auto p-6">
      
      {/* Photo + nom */}
      <div className="text-center mb-8">
        <img
          src={coach.photo_url || '/default-avatar.png'}
          alt={coach.name}
          className="w-40 h-40 rounded-full mx-auto object-cover shadow-lg"
        />
        <h1 className="text-4xl font-bold mt-4">{coach.name}</h1>
        <p className="text-lg text-gray-600">{coach.specialty}</p>
      </div>

      {/* Bio */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10 text-center max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">À propos</h2>
        <p className="text-gray-700 leading-relaxed">{coach.bio}</p>
      </div>

      {/* Calendrier */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4 text-center">Réserver une séance</h2>
        <CoachCalendar coachId={coach.id} />
      </div>

      {/* Paiement */}
      <div className="text-center">
        <a
          href={coach.stripe_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition"
        >
          💳 Payer et confirmer la réservation
        </a>
      </div>
    </div>
  )
}
