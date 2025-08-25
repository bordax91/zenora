'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function CoachWelcomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [coach, setCoach] = useState(null)

  useEffect(() => {
    const fetchCoach = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/connectcoach')
        return
      }

      const { data: coachData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'coach')
        .single()

      if (error || !coachData) {
        router.push('/connectcoach')
        return
      }

      // Redirection obligatoire si le username est vide
      if (!coachData.username || coachData.username.trim() === '') {
        router.push('/coach/onboarding')
        return
      }

      setCoach(coachData)
      setLoading(false)
    }

    fetchCoach()
  }, [])

  if (loading) return <p className="text-center py-10">Chargement...</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">👋 Bienvenue, {coach.name} !</h1>

      <p className="text-gray-700 mb-6">
        Voici un aperçu de votre profil public et de vos offres. Vous pouvez copier votre lien de profil ou ajouter une nouvelle offre.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">🧑‍💼 Votre profil public</h2>
        <p className="mb-2">Nom : <strong>{coach.name}</strong></p>
        <p className="mb-2">Spécialité : <strong>{coach.specialty || 'Non renseignée'}</strong></p>
        <p className="mb-4">Bio : <em>{coach.bio || 'Aucune description.'}</em></p>
        <p className="text-indigo-600">
          Lien public : <a className="underline" href={`/${coach.username}`} target="_blank">{`zenoraapp.com/${coach.username}`}</a>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🎁 Vos offres (packages)</h2>
          <button
            onClick={() => router.push('/coach/packages')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Ajouter une offre
          </button>
        </div>

        {/* Ici tu peux insérer la récupération des packages du coach si tu veux */}
        <p className="text-gray-500">Vous pouvez créer et afficher vos offres ici.</p>
      </div>
    </div>
  )
}
