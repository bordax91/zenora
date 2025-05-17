'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function CoachDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [editingSession, setEditingSession] = useState(null)
  const [noteCoach, setNoteCoach] = useState('')
  const [newDate, setNewDate] = useState('')
  const [clientId, setClientId] = useState('')
  const [statut, setStatut] = useState('prévu')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      setUserId(user.id)

      const { data: clientsData } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'client')

      setClients(clientsData || [])

      const { data: sessionList, error } = await supabase
        .from('sessions')
        .select(`
          id,
          date,
          statut,
          note_coach,
          note_client,
          client:client_id (id, email)
        `)
        .eq('coach_id', user.id)
        .order('date', { ascending: true })

      if (error) console.error('Erreur chargement sessions:', error)
      else setSessions(sessionList || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleEditClick = (session) => {
    setEditingSession(session)
    setNoteCoach(session.note_coach || '')
    setNewDate(session.date)
    setClientId(session.client?.id || '')
    setStatut(session.statut)
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setNoteCoach('')
    setNewDate('')
    setClientId('')
    setStatut('prévu')
  }

  const handleSaveChanges = async () => {
    if (!newDate || !clientId) return

    if (editingSession?.id) {
      const { error } = await supabase
        .from('sessions')
        .update({
          note_coach: noteCoach,
          date: newDate,
          client_id: clientId,
          statut: statut
        })
        .eq('id', editingSession.id)

      if (error) {
        alert("Erreur lors de la mise à jour")
      } else {
        alert("Modifications enregistrées")
        window.location.reload()
      }
    } else {
      const { error } = await supabase
        .from('sessions')
        .insert({
          coach_id: userId,
          client_id: clientId,
          date: newDate,
          statut: statut,
          note_coach: noteCoach
        })

      if (error) {
        alert("Erreur lors de la création")
      } else {
        alert("Session créée")
        window.location.reload()
      }
    }
  }

  const handleDeleteSession = async (id) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) {
      alert('Erreur suppression session')
    } else {
      setSessions(sessions.filter((s) => s.id !== id))
    }
  }

  const isPast = (dateStr) => new Date(dateStr) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-800">Zenora</span>
        </Link>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/chat" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm text-center hover:bg-blue-700 transition">
            🧠 Discuter avec notre IA
          </Link>
          <Link href="/coach" className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm text-center shadow border hover:bg-blue-50 transition">
            👤 Discuter avec un coach mental
          </Link>
        </div>
      </header>

      <div className="mb-6">
        {!editingSession && (
          <button
            onClick={() => setEditingSession({})}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ➕ Créer une session
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Vos sessions</h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : (
        <ul className="space-y-6">
          {editingSession && (
            <li className="bg-white p-4 rounded-xl shadow border">
              <label className="block text-sm">Date et heure</label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border px-2 py-2 rounded"
              />

              <label className="block text-sm mt-2">Client</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">— Choisir un client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.email}</option>
                ))}
              </select>

              <label className="block text-sm mt-2">Statut</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
              >
                <option value="prévu">prévu</option>
                <option value="terminé">terminé</option>
              </select>

              <label className="block text-sm mt-2">Note du coach</label>
              <textarea
                rows={2}
                value={noteCoach}
                onChange={(e) => setNoteCoach(e.target.value)}
                className="w-full border px-2 py-2 rounded"
                placeholder="Ajoutez une note pour cette session..."
              />

              <div className="flex flex-col sm:flex-row gap-4 mt-3">
                <button onClick={handleSaveChanges} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Enregistrer
                </button>
                <button onClick={handleCancelEdit} className="text-gray-600 hover:underline text-sm">
                  Annuler
                </button>
              </div>
            </li>
          )}

          {sessions.map((session) => {
            const isEditing = editingSession?.id === session.id
            const isExpired = isPast(session.date)

            return (
              <li key={session.id} className="bg-white p-4 rounded-xl shadow border">
                <p><strong>Date :</strong> {new Date(session.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <p><strong>Client :</strong> {session.client?.email || '—'}</p>
                <p><strong>Statut :</strong> {session.statut}</p>
                {session.note_client && <p><strong>Note du client :</strong> {session.note_client}</p>}
                {session.note_coach && <p><strong>Note du coach :</strong> {session.note_coach}</p>}

                {!isExpired && (
                  <div className="flex flex-col sm:flex-row gap-4 mt-3">
                    <button
                      onClick={() => handleEditClick(session)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

