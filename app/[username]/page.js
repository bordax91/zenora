'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import CoachCalendar from '@/components/CoachCalendar'
import Link from 'next/link'

export default function CoachProfilePage() {
  const { username } = useParams()
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (username) {
      fetchCoach()
    }
    checkAuth()
  }, [username])

  const fetchCoach = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'coach')
      .single()

    if (error) console.error('❌ Erreur récupération coach:', error)
    else setCoach(data)
    setLoading(false)
  }

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data?.user || null)
  }

  if (loading) {
    return <p className="text-center py-10">Chargement...</p>
  }

  if (!coach) {
    return <p className="text-center py-10 text-red-500">Coach introuvable.</p>
  }

  return (
    <div className="relative">
      {/* === FOND : profil coach === */}
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
      </div>

      {/* === OVERLAY LOGIN si pas connecté === */}
      {!user && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Connectez-vous pour réserver</h2>
            <div className="flex flex-col gap-3">
              <Link
                href={`/login?redirect=/zenoraapp/${username}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Se connecter
              </Link>
              <Link
                href={`/register?redirect=/zenoraapp/${username}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
