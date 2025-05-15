'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CoachDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')
  const [date, setDate] = useState('')
  const [statut, setStatut] = useState('prévu')
  const [userId, setUserId] = useState('')

  // Récupère les clients et l'utilisateur connecté
  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      setUserId(user.id)

      const { data: clientList } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'client')

      setClients(clientList || [])

      const { data: sessionList } = await supabase
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

      setSessions(sessionList || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleCreateSession = async (e) => {
    e.preventDefault()
    if (!clientId || !date || !userId) return

    const { error } = await supabase.from('sessions').insert({
      coach_id: userId,
      client_id: clientId,
      date,
      statut,
    })

    if (error) {
      alert('Erreur création session')
      console.error(error)
    } else {
      alert('Session créée !')
      window.location.reload()
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vos sessions</h1>

      {/* Formulaire de création */}
      <form onSubmit={handleCreateSession} className="mb-6 bg-gray-50 p-4 rounded-xl shadow">
        <div className="mb-4">
          <label className="block text-sm mb-1">Client</label>
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
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Date</label>
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Statut</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            <option value="prévu">prévu</option>
            <option value="terminé">terminé</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Créer la session
        </button>
      </form>

      {/* Affichage des sessions */}
      {loading ? (
        <p>Chargement des sessions...</p>
      ) : sessions.length === 0 ? (
        <p>Aucune session prévue pour l’instant.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="bg-white p-4 rounded-xl shadow border">
              <p><strong>Date :</strong> {new Date(session.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p><strong>Client :</strong> {session.client?.email || '—'}</p>
              <p><strong>Statut :</strong> {session.statut}</p>
              <p><strong>Note du coach :</strong> {session.note_coach || '—'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
