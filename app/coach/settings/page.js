'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CoachSettingsPage() {
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCoach = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/connectcoach')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, username')
        .eq('id', user.id)
        .eq('role', 'coach')
        .single()

      if (error || !data) {
        router.push('/connectcoach')
        return
      }

      setCoach(data)
      setLoading(false)
    }

    fetchCoach()
  }, [])

  const handlePasswordReset = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return alert("Impossible de récupérer votre email.")
    const { error } = await supabase.auth.resetPasswordForEmail(user.email)
    if (error) {
      alert("Erreur lors de l'envoi du lien de réinitialisation.")
    } else {
      alert("Un email de réinitialisation a été envoyé.")
    }
  }

  if (loading) return <p className="text-center py-10">Chargement...</p>

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">⚙️ Paramètres du compte</h1>

      <div className="space-y-4">
        <p><strong>Nom :</strong> {coach.name}</p>
        <p><strong>Email :</strong> {coach.email}</p>
        <p><strong>Nom d’utilisateur :</strong> {coach.username}</p>

        <div className="mt-4">
          <button
            onClick={handlePasswordReset}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Modifier le mot de passe
          </button>
        </div>

        <hr className="my-6" />

        <div className="space-y-3">
          <Link
            href="/coach/edit-profile"
            className="text-indigo-600 hover:underline block"
          >
            ✏️ Modifier mon profil coach
          </Link>

          <Link
            href="/coach/integrations"
            className="text-indigo-600 hover:underline block"
          >
            🔌 Gérer mes intégrations
          </Link>

          <Link
            href="/coach/abonnement"
            className="text-indigo-600 hover:underline block"
          >
            💳 Voir mon abonnement
          </Link>
        </div>
      </div>
    </div>
  )
}
