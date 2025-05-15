'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const [editingSession, setEditingSession] = useState(null)
  const [newDate, setNewDate] = useState('')

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

  const handleEditClick = (session) => {
    setEditingSession(session)
    setNewDate(session.date)
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setNewDate('')
  }

  const handleSaveChanges = async () => {
    if (!editingSession) return

    const { error } = await supabase
      .from('sessions')
      .update({ date: newDate })
      .eq('id', editingSession.id)

    if (error) {
      alert('Erreur lors de la modification')
    } else {
      alert('Session mise à jour')
      window.location.reload()
    }
  }

  const handleCancelSession = async (id) => {
    const { error } = await supabase
      .from('sessions')
      .update({ statut: 'annulé' })
      .eq('id', id)

    if (error) {
      alert("Erreur lors de l'annulation")
    } else {
      alert('Session annulée')
      window.location.reload()
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vos rendez-vous</h1>

      {loading ? (
        <p>Chargement des sessions...</p>
      ) : sessions.length === 0 ? (
        <p>Aucune session prévue.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => (
            <li key={session.id} className="bg-white p-4 rounded-xl shadow border">
              <p><strong>Date :</strong>{' '}
                {new Date(session.date).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p><strong>Coach :</strong> {session.coach?.email || '—'}</p>
              <p><strong>Statut :</strong> {session.statut}</p>
              {session.note_coach && (
                <p><strong>Note du coach :</strong> {session.note_coach}</p>
              )}

              {editingSession?.id === session.id ? (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm">Nouvelle date</label>
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border px-2 py-2 rounded"
                  />

                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={handleSaveChanges}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:underline"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleEditClick(session)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Modifier
                  </button>
                  {session.statut !== 'annulé' && (
                    <button
                      onClick={() => handleCancelSession(session.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
