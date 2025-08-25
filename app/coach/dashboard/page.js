'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { DateTime } from 'luxon'

export default function CoachDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchSessions = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user
    if (!user) return

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        date,
        client:client_id (
          name,
          email
        )
      `)
      .eq('coach_id', user.id)
      .order('date', { ascending: true })

    if (!error) setSessions(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleAddSession = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const coach = authData?.user
    if (!coach) return alert("Coach non identifié")

    const { data: existingClient } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    let clientId = existingClient?.id

    if (!clientId) {
      const { data: newClient, error: insertError } = await supabase
        .from('users')
        .insert({ email, name, role: 'client' })
        .select()
        .single()

      if (insertError || !newClient) return alert('Erreur création client')

      clientId = newClient.id
    }

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        coach_id: coach.id,
        client_id: clientId,
        date: selectedDate.toISOString()
      })

    if (sessionError) return alert('Erreur création session')

    setName('')
    setEmail('')
    setSelectedDate(new Date())
    fetchSessions()
  }

  const handleDeleteSession = async (sessionId) => {
    const confirmDelete = confirm('Supprimer cette session ?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      alert('Erreur lors de la suppression')
    } else {
      fetchSessions()
    }
  }

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📅 Vos rendez-vous</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">➕ Ajouter une session</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nom"
            className="border px-3 py-2 rounded w-full md:w-auto"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="border px-3 py-2 rounded w-full md:w-auto"
          />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="Pp"
            className="border px-3 py-2 rounded w-full md:w-auto"
          />
          <button
            onClick={handleAddSession}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Ajouter
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Aucun rendez-vous trouvé.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const parisDate = DateTime.fromISO(session.date, { zone: 'utc' }).setZone('Europe/Paris')
                const isPast = parisDate < DateTime.now().setZone('Europe/Paris')

                return (
                  <tr key={session.id} className="border-t">
                    <td className="px-4 py-3">
                      {parisDate.toFormat('dd MMM yyyy, HH:mm')}
                    </td>
                    <td className="px-4 py-3">{session.client?.name || '—'}</td>
                    <td className="px-4 py-3">{session.client?.email || '—'}</td>
                    <td className="px-4 py-3">
                      {isPast ? (
                        <span className="text-green-600 font-medium">Terminé</span>
                      ) : (
                        <span className="text-blue-600 font-medium">Prévu</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isPast && (
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
