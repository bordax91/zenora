'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientSettings() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('uuid', user.id)
        .single()

      if (!error) {
        setProfile(data)
      } else {
        console.error('Erreur récupération profil client :', error)
      }

      setLoading(false)
    }

    fetchUserAndProfile()
  }, [])

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border mt-8">
      <h1 className="text-2xl font-bold mb-6">⚙️ Paramètres du compte</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : !user ? (
        <p>Utilisateur non connecté.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom / Prénom</label>
            <input
              type="text"
              value={profile?.name || ''}
              readOnly
              className="w-full border px-4 py-2 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Adresse email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full border px-4 py-2 rounded bg-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  )
}
