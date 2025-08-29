'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function CoachProfilePage() {
  const { username } = useParams()
  const router = useRouter()

  const [coach, setCoach] = useState(null)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCoachActive, setIsCoachActive] = useState(true)

  useEffect(() => {
    if (!username) return

    const fetchData = async () => {
      const { data: coachData, error: coachError } = await supabase
        .from('users')
        .select('id, name, username, photo_url, specialty, bio, trial_start, trial_end, is_subscribed')
        .eq('username', username)
        .eq('role', 'coach')
        .single()

      if (coachError || !coachData) {
        console.error('Erreur récupération coach:', coachError)
        setCoach(null)
        setLoading(false)
        return
      }

      // Vérification de l’abonnement ou période d’essai
      const now = new Date()
      let trialEnd = null

      if (coachData.trial_end) {
        trialEnd = new Date(coachData.trial_end)
      } else if (coachData.trial_start) {
        const start = new Date(coachData.trial_start)
        trialEnd = new Date(start)
        trialEnd.setDate(start.getDate() + 7)
      }

      const isTrialExpired = trialEnd ? now > trialEnd : true
      const isSubscribed = coachData.is_subscribed === true

      if (isTrialExpired && !isSubscribed) {
        setIsCoachActive(false)
        setCoach(null)
        setLoading(false)
        return
      }

      setCoach(coachData)

      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('coach_id', coachData.id)

      if (packagesError) {
        console.error('Erreur récupération packages:', packagesError)
      } else {
        setPackages(packagesData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [username])

  if (loading) {
    return <p className="text-center py-10">Chargement...</p>
  }

  if (!coach) {
    return (
      <div className="text-center py-10 text-red-500">
        {isCoachActive === false
          ? 'Ce coach n’est plus disponible actuellement.'
          : 'Coach introuvable.'}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      {/* Bouton "Se connecter" en haut à droite */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => router.push('/connectclient')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Se connecter
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 mt-6">
        {/* Partie gauche : bio */}
        <div className="flex-1">
          <div className="text-center mb-8">
            <img
              src={coach.photo_url || '/default-avatar.png'}
              alt={coach.name}
              className="w-40 h-40 rounded-full mx-auto object-cover shadow-lg"
            />
            <h1 className="text-4xl font-bold mt-4">{coach.name}</h1>
            <p className="text-lg text-gray-600">{coach.specialty}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center mb-10">
            <h2 className="text-xl font-semibold mb-3">À propos</h2>
            <p className="text-gray-700 leading-relaxed">{coach.bio}</p>
          </div>
        </div>

        {/* Partie droite : packages */}
        <div className="w-full lg:w-1/3 space-y-6">
          <h2 className="text-xl font-semibold mb-2 text-center lg:text-left">Choisir une offre</h2>
          {packages.length === 0 && (
            <p className="text-gray-500 text-center">Aucun package disponible.</p>
          )}

          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer border"
              onClick={() => router.push(`/booking/${pkg.id}`)}
            >
              <h3 className="text-lg font-bold mb-1">{pkg.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
              <p className="text-right font-medium text-indigo-600">{pkg.price} €</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
