'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import CoachCalendar from '@/components/CoachCalendar'

export default function CoachProfilePage() {
  const { username } = useParams()
  const router = useRouter()

  const [coach, setCoach] = useState(null)
  const [loadingCoach, setLoadingCoach] = useState(true)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Récupération du coach
  useEffect(() => {
    if (!username) return
    const fetchCoach = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('role', 'coach')
        .single()
      if (error) {
        console.error('❌ Erreur récupération coach:', error)
        setCoach(null)
      } else {
        setCoach(data)
      }
      setLoadingCoach(false)
    }
    fetchCoach()
  }, [username])

  // Auth + listener pour mise à jour utilisateur
  useEffect(() => {
    let unsub = null
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      const currentUser = data?.user || null
      setUser(currentUser)
      setAuthChecked(true)

      // Redirection si pas connecté
      if (!currentUser) {
        router.replace(`/login?redirect=/${username}`)
        return
      }

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })
      unsub = sub?.subscription
    }
    init()
    return () => {
      if (unsub) unsub.unsubscribe()
    }
  }, [router, username])

  if (loadingCoach || !authChecked) {
    return <p className="text-center py-10">Chargement...</p>
  }

  if (!coach) {
    return <p className="text-center py-10 text-red-500">Coach introuvable.</p>
  }

  return (
    <div className="relative">
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center mb-8">
          <img
            src={coach.photo_url || '/default-avatar.png'}
            alt={coach.name}
            className="w-40 h-40 rounded-full mx-auto object-cover shadow-lg"
          />
          <h1 className="text-4xl font-bold mt-4">{coach.name}</h1>
          <p className="text-lg text-gray-600">{coach.specialty}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-10 text-center max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">À propos</h2>
          <p className="text-gray-700 leading-relaxed">{coach.bio}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-10">
          <h2 className="text-xl font-semibold mb-4 text-center">Réserver une séance</h2>
          <CoachCalendar coachId={coach.id} />
        </div>
      </div>
    </div>
  )
}
