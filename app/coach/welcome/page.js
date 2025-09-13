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
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!user || authError) {
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

      if (!coachData.username || coachData.username.trim() === '') {
        router.push('/coach/onboarding')
        return
      }

      setCoach(coachData)
      setLoading(false)
    }

    fetchCoach()
  }, [router])

  if (loading) return <p className="text-center py-10">Chargement...</p>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">👋 Bienvenue, {coach.name} !</h1>

      <p className="text-gray-700 mb-6">
        Voici un aperçu de votre profil public et de vos offres. Vous pouvez copier votre lien de profil ou ajouter une nouvelle offre.
      </p>

      {/* ✅ Bloc important : Connexion Stripe */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚡ Connectez votre compte Stripe
        </h2>
        <p className="text-yellow-700 mb-4">
          Pour recevoir vos paiements de vos clients, vous devez connecter votre compte Stripe.
        </p>
        <button
          onClick={() => router.push('/coach/integrations')}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
        >
          Connecter mon compte Stripe
        </button>
      </div>

      {/* Profil coach */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
        {coach.photo_url ? (
          <img
            src={coach.photo_url}
            alt={coach.name}
            className="w-32 h-32 rounded-full object-cover border shadow"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
            Aucune photo
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">🧑‍💼 Votre profil public</h2>
          <p className="mb-1">Nom : <strong>{coach.name}</strong></p>
          <p className="mb-1">Spécialité : <strong>{coach.specialty || 'Non renseignée'}</strong></p>
          <p className="mb-2">Bio : <em>{coach.bio || 'Aucune description.'}</em></p>
          <p className="text-indigo-600">
            Lien public :{' '}
            <a
              className="underline"
              href={`/${coach.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              zenoraapp.com/{coach.username}
            </a>
          </p>
        </div>
      </div>

      {/* Packages coach */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🎁 Vos offres (packages)</h2>
          <button
            onClick={() => router.push('/coach/packages')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Ajouter une offre
          </button>
        </div>

        <p className="text-gray-500">Vous pouvez créer et afficher vos offres ici.</p>
        {/* Tu pourras insérer ici la liste des packages plus tard */}
      </div>
    </div>
  )
}
