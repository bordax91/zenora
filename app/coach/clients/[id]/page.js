'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DateTime } from 'luxon'

export default function ClientDetailsPage() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [sessions, setSessions] = useState([])
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const coach = authData?.user
      if (!coach) return

      const { data: clientData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', id)
        .single()
      setClient(clientData)

      const { data: sessionData } = await supabase
        .from('sessions')
        .select('id, date')
        .eq('coach_id', coach.id)
        .eq('client_id', id)
        .order('date', { ascending: false })
      setSessions(sessionData || [])

      const { data: notesData } = await supabase
        .from('notes')
        .select('id, content, created_at')
        .eq('coach_id', coach.id)
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      setNotes(notesData || [])

      setLoading(false)
    }

    fetchData()
  }, [id])

  const handleAddNote = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const coach = authData?.user
    if (!coach || !newNote.trim()) return

    const { data: newNoteData, error } = await supabase
      .from('notes')
      .insert({
        coach_id: coach.id,
        client_id: id,
        content: newNote
      })
      .select()
      .single()

    if (error) return alert('Erreur lors de l’ajout de la note')

    setNotes([newNoteData, ...notes])
    setNewNote('')
  }

  const handleDeleteNote = async (noteId) => {
    const confirmDelete = confirm('Supprimer cette note ?')
    if (!confirmDelete) return

    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (!error) {
      setNotes(notes.filter((n) => n.id !== noteId))
    }
  }

  const handleEditNote = (noteId, content) => {
    setEditingNoteId(noteId)
    setEditingContent(content)
  }

  const handleUpdateNote = async () => {
    const { error } = await supabase
      .from('notes')
      .update({ content: editingContent })
      .eq('id', editingNoteId)

    if (!error) {
      setNotes(notes.map((n) => (n.id === editingNoteId ? { ...n, content: editingContent } : n)))
      setEditingNoteId(null)
      setEditingContent('')
    } else {
      alert('Erreur lors de la mise à jour')
    }
  }

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🧍‍♀️ Détails du client</h1>

      <div className="bg-white rounded-lg shadow p-4">
        <p><strong>Nom :</strong> {client?.name || '—'}</p>
        <p><strong>Email :</strong> {client?.email || '—'}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">🗓 Sessions</h2>
        {sessions.length === 0 ? (
          <p>Aucune session.</p>
        ) : (
          <ul className="list-disc list-inside">
            {sessions.map((s) => {
              const parisTime = DateTime.fromISO(s.date, { zone: 'utc' }).setZone('Europe/Paris')
              return (
                <li key={s.id}>
                  {parisTime.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">📝 Notes</h2>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Ajouter une note..."
          className="w-full border rounded p-2 mb-2"
        />
        <button
          onClick={handleAddNote}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ajouter
        </button>

        {notes.length === 0 ? (
          <p className="mt-4 text-gray-500">Aucune note pour ce client.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {notes.map((note) => {
              const createdAtParis = DateTime.fromISO(note.created_at, { zone: 'utc' }).setZone('Europe/Paris')
              return (
                <li key={note.id} className="border rounded p-3 bg-gray-50 relative">
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        className="w-full border rounded p-2 mb-2"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateNote}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="text-gray-500 hover:underline"
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {createdAtParis.toLocaleString(DateTime.DATETIME_MED)}
                      </p>
                      <div className="absolute top-2 right-2 flex gap-3 text-sm">
                        <button
                          onClick={() => handleEditNote(note.id, note.content)}
                          className="text-blue-600 hover:underline"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:underline"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
