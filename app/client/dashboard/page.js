'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function ClientDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSession, setEditingSession] = useState(null)
  const [noteClient, setNoteClient] = useState('')
  const [newDate, setNewDate] = useState('')

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
    setNoteClient(session.note_client || '')
    setNewDate(session.date)
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setNoteClient('')
    setNewDate('')
  }

  const handleSaveChanges = async () => {
    if (!editingSession) return

    const { error } = await supabase
      .from('sessions')
      .update({
        note_client: noteClient,
        date: newDate
      })
      .eq('id', editingSession.id)

    if (error) {
      alert("Erreur lors de la mise à jour")
    } else {
      alert("Modifications enregistrées")
      window.location.reload()
    }
  }

  const isPast = (dateStr) => new Date(dateStr) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <header className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-800">Zenora</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/chat" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            🧠 Discuter avec notre IA
          </Link>
          <Link href="/coach" className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm shadow border hover:bg-blue-50 transition">
            👤 Discuter avec un coach mental
          </Link>
        </div>
      </header>

      <h1 className="text-2xl font-bold mb-4">Vos rendez-vous</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : sessions.length === 0 ? (
        <p>Aucune session prévue.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => {
            const isEditing = editingSession?.id === session.id
            const isExpired = isPast(session.date)

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

                {isEditing ? (
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm">Nouvelle date et heure</label>
                    <input
                      type="datetime-local"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full border px-2 py-2 rounded"
                    />

                    <label className="block text-sm">Votre note</label>
                    <textarea
                      rows={2}
                      value={noteClient}
                      onChange={(e) => setNoteClient(e.target.value)}
                      className="w-full border px-2 py-2 rounded"
                      placeholder="Exprimez vos ressentis ou remarques..."
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
                        className="text-gray-600 hover:underline text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {session.note_client && (
                      <p><strong>Votre note :</strong> {session.note_client}</p>
                    )}
                    {!isExpired && session.statut !== 'annulé' && (
                      <button
                        onClick={() => handleEditClick(session)}
                        className="mt-3 text-blue-600 text-sm hover:underline"
                      >
                        {session.note_client ? 'Modifier ma note / la date' : 'Ajouter une note ou changer la date'}
                      </button>
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

