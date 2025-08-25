'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientSettings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)
      setLoading(false)
    }

    fetchUser()
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
              value={user.user_metadata?.full_name || ''}
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

          <div>
            <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              value="•••••••••••"
              readOnly
              className="w-full border px-4 py-2 rounded bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Pour modifier votre mot de passe, <a href="/reset-password" className="text-blue-600 underline">cliquez ici</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
