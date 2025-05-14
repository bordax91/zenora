'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CoachDashboard() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('coach_id', user.id) // ou 'client_id' si tu fais pour le client
          .order('date', { ascending: true })

        if (error) {
          console.error('Erreur chargement sessions:', error)
        } else {
          setSessions(data)
        }
      }
    }

    fetchSessions()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vos sessions</h1>
      {sessions.length === 0 ? (
        <p>Aucune session prévue pour l’instant.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="bg-white p-4 rounded-xl shadow">
              <p><strong>Date :</strong> {new Date(session.date).toLocaleString()}</p>
              <p><strong>Client :</strong> {session.client_id}</p>
              <p><strong>Statut :</strong> {session.statut}</p>
              <p><strong>Note :</strong> {session.note_coach}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
