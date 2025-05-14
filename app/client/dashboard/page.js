'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientDashboard() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            *,
            coach:coach_id ( id, full_name, email )  -- si tu veux afficher le nom du coach
          `)
          .eq('client_id', user.id)
          .order('date', { ascending: true })

        if (error) {
          console.error('Erreur chargement sessions client :', error)
        } else {
          setSessions(data)
        }
      }
    }

    fetchSessions()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vos rendez-vous</h1>
      {sessions.length === 0 ? (
        <p>Aucune session prévue.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="bg-white p-4 rounded-xl shadow">
              <p><strong>Date :</strong> {new Date(session.date).toLocaleString()}</p>
              <p><strong>Coach :</strong> {session.coach?.full_name || session.coach_id}</p>
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
