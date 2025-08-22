'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CoachDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          date,
          statut,
          client:client_id (
            name,
            email
          )
        `)
        .eq('coach_id', user.id)
        .order('date', { ascending: true })

      if (error) {
        console.error('Erreur chargement sessions:', error)
      } else {
        setSessions(data || [])
      }
      setLoading(false)
    }

    fetchSessions()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-500">Chargement...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📅 Vos rendez-vous</h1>

      {sessions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Aucun rendez-vous trouvé.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t">
                  <td className="px-4 py-3">
                    {new Date(session.date).toLocaleString('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </td>
                  <td className="px-4 py-3">{session.client?.name || '—'}</td>
                  <td className="px-4 py-3">{session.client?.email || '—'}</td>
                  <td className="px-4 py-3">
                    {session.statut === 'prévu' ? (
                      <span className="text-blue-600 font-medium">Prévu</span>
                    ) : session.statut === 'terminé' ? (
                      <span className="text-green-600 font-medium">Terminé</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
