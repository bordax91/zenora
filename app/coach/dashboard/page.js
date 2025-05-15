'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CoachDashboard() {
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
            client:client_id (
              email
            )
          `)
          .eq('coach_id', user.id)
          .order('date', { ascending: true })

        if (!error) setSessions(data)
        else console.error('Erreur chargement sessions:', error)
      }

      setLoading(false)
    }

    fetchSessions()
  }, [])

  const handleNoteChange = async (id, note) => {
    const { error } = await supabase
      .from('sessions')
      .update({ note_coach: note })
      .eq('id', id)

    if (error) {
      alert('Erreur en enregistrant la note')
      console.error(error)
    } else {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, note_coach: note } : s))
      )
    }
  }

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'prévu' ? 'terminé' : 'prévu'
    const { error } = await supabase
      .from('sessions')
      .update({ statut: newStatus })
      .eq('id', id)

    if (error) {
      alert('Erreur en changeant le statut')
    } else {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, statut: newStatus } : s))
      )
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vos sessions</h1>

      {loading ? (
        <p>Chargement des sessions...</p>
      ) : sessions.length === 0 ? (
        <p>Aucune session prévue pour l’instant.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => (
            <li key={session.id} className="bg-white p-4 rounded-xl shadow border space-y-2">
              <p><strong>Date :</strong>{' '}
                {new Date(session.date).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p><strong>Client :</strong> {session.client?.email || '—'}</p>
              <p><strong>Statut :</strong> {session.statut}</p>

              <button
                className="text-sm text-blue-600 underline"
                onClick={() => handleStatusToggle(session.id, session.statut)}
              >
                Changer le statut
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note du coach :
                </label>
                <textarea
                  rows={2}
                  value={session.note_coach || ''}
                  onChange={(e) => handleNoteChange(session.id, e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Écrire une note..."
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
