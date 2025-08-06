'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import CoachCalendar from '@/components/CoachCalendar' // 📌 Assure-toi que ce composant existe

// 📌 Config Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachProfilePage() {
  const { username } = useParams()
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      fetchCoach()
    }
  }, [username])

  const fetchCoach = async () => {
    const { data, error } = await supabase
      .from('users') // ✅ On utilise la table "users"
      .select('*')
      .eq('username', username) // On filtre par username
      .eq('role', 'coach') // On filtre pour ne récupérer que les coaches
      .single()

    if (error) {
      console.error('Erreur récupération coach:', error)
    } else {
      setCoach(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <p className="text-center py-10">Chargement...</p>
  }

  if (!coach) {
    return <p className="text-center py-10 text-red-500">Coach introuvable.</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <img
          src={coach.photo_url || '/default-avatar.png'}
          alt={coach.name}
          className="w-32 h-32 rounded-full mx-auto object-cover"
        />
        <h1 className="text-3xl font-bold mt-4">{coach.name}</h1>
        <p className="text-gray-600">{coach.specialty}</p>
      </div>

      {/* Bio */}
      <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-2">À propos</h2>
        <p>{coach.bio}</p>
      </div>

      {/* Services */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Services proposés</h2>
        <ul className="list-disc list-inside space-y-2">
          {coach.services?.map((service, i) => (
            <li key={i}>{service}</li>
          ))}
        </ul>
      </div>

      {/* 📅 Calendrier intégré */}
      <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Réserver une séance</h2>
        <CoachCalendar coachId={coach.id} />
      </div>

      {/* CTA Paiement Stripe */}
      <div className="text-center mt-6">
        <a
          href={coach.stripe_link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Payer et confirmer la réservation
        </a>
      </div>
    </div>
  )
}
