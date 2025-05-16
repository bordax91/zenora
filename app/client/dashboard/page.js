'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingNoteId, setEditingNoteId] = useState(null)
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

  const handleEditNoteClick = (session) => {
    setEditingNoteId(session.id)
    setNoteClient(session.note_client || '')
  }

  const handleCancelNoteEdit = () => {
    setEditingNoteId(null)
    setNoteClient('')
  }

  const handleSaveNote = async () => {
    if (!editingNoteId) return

    const { error } = await supabase
      .from('sessions')
      .update({ note_client: noteClient })
      .eq('id', editingNoteId)

    if (error) {
      alert('Erreur lors de la mise à jour de la note.')
    } else {
      alert('Note enregistrée.')
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

              {/* Affichage de la note du coach */}
              <p><strong>Note du coach :</strong> {session.note_coach || '—'}</p>

              {/* Bloc pour modifier ou ajouter une note client */}
              {editingNoteId === session.id ? (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm">Votre note</label>
                  <textarea
                    rows={2}
                    value={noteClient}
                    onChange={(e) => setNoteClient(e.target.value)}
                    className="w-full border px-2 py-2 rounded"
                    placeholder="Exprimez vos ressentis ou observations..."
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveNote}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelNoteEdit}
                      className="text-gray-600 hover:underline text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p><strong>Votre note :</strong> {session.note_client || '—'}</p>
                  <button
                    onClick={() => handleEditNoteClick(session)}
                    className="mt-3 text-blue-600 text-sm hover:underline"
                  >
                    {session.note_client ? 'Modifier ma note' : 'Ajouter une note'}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
