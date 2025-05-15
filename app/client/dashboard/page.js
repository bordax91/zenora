'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            id,
            date,
            statut,
            note_coach,
            coach:coach_id (
              full_name,
              email
            )
          `)
          .eq('client_id', user.id)
          .order('date', { ascending: true })

        if (error) {
          console.error('Erreur chargement sessions client :', error)
        } else {
          setSessions(data)
        }
      }

      setLoading(false)
    }

    fetchSessions()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vos rendez-vous</h1>

      {loading ? (
        <p>Chargement des sessions...</p>
      ) : sessions.length === 0 ? (
        <p>Aucune session prévue.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="bg-white p-4 rounded-xl shadow border">
              <p><strong>Date :</strong>{' '}
                {new Date(session.date).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p><strong>Coach :</strong> {session.coach?.full_name || session.coach?.email || '—'}</p>
              <p><strong>Statut :</strong> {session.statut}</p>
              {session.note_coach && (
                <p><strong>Note du coach :</strong> {session.note_coach}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
