'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSession, setEditingSession] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [noteClient, setNoteClient] = useState('')

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
          note_coach,
          note_client,
          coach:coach_id (
            email
          )
        `)
        .eq('client_id', user.id)
        .order('date', { ascending: true })

      if (error) console.error('Erreur chargement sessions client :', error)
      else setSessions(data || [])

      setLoading(false)
    }

    fetchSessions()
  }, [])

  const handleEditClick = (session) => {
    setEditingSession(session)
    setNewDate(session.date)
    setNoteClient(session.note_client || '')
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setNewDate('')
    setNoteClient('')
  }

  const handleSaveChanges = async () => {
    if (!editingSession) return

    const { error } = await supabase
      .from('sessions')
      .update({
        date: newDate,
        note_client: noteClient,
      })
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
      .update({
        statut: 'annulé',
        note_client: noteClient,
      })
      .eq('id', id)

    if (error) {
      alert("Erreur lors de l'annulation")
    } else {
      alert('Session annulée')
      window.location.reload()
    }
  }

  const isPast = (dateStr) => new Date(dateStr) < new Date()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vos rendez-vous</h1>

      {loading ? (
        <p>Chargement des sessions...</p>
      ) : sessions.length === 0 ? (
        <p>Aucune session prévue.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => {
            const sessionIsPast = isPast(session.date)
            const isEditing = editingSession?.id === session.id

            return (
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
                {session.note_client && !isEditing && (
                  <p><strong>Votre note :</strong> {session.note_client}</p>
                )}

                {/* Actions */}
                {!sessionIsPast && session.statut !== 'annulé' && (
                  <>
                    {isEditing ? (
                      <div className="mt-4 space-y-2">
                        <label className="block text-sm">Nouvelle date</label>
                        <input
                          type="datetime-local"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full border px-2 py-2 rounded"
                        />
                        <label className="block text-sm mt-2">Votre note (facultatif)</label>
                        <textarea
                          rows={2}
                          value={noteClient}
                          onChange={(e) => setNoteClient(e.target.value)}
                          className="w-full border px-2 py-2 rounded"
                          placeholder="Pourquoi voulez-vous modifier la session ?"
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
                        <div className="mt-2">
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Annuler la session
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
                        <button
                          onClick={() => {
                            setEditingSession(session)
                            setNoteClient('')
                          }}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
