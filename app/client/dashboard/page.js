'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          date,
          statut,
          coach:coach_id (
            username,
            email
          )
        `)
        .eq('client_id', user.id)
        .order('date', { ascending: true })

      if (error) {
        console.error('Erreur chargement sessions client :', error)
      } else {
        setSessions(data || [])
      }

      setLoading(false)
    }

    fetchSessions()
  }, [])

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📅 Vos rendez-vous
      </h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-500">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 border">Date</th>
                <th className="px-4 py-3 border">Coach</th>
                <th className="px-4 py-3 border">Statut</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t">
                  <td className="px-4 py-3 border">
                    {new Date(session.date).toLocaleString('fr-FR', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3 border">
                    {session.coach?.username || '—'}
                  </td>
                  <td className="px-4 py-3 border">
                    {session.statut || '—'}
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
