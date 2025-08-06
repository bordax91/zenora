'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CoachDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          date,
          statut,
          client:client_id (email)
        `)
        .eq('coach_id', user.id)
        .order('date', { ascending: true })

      if (!error) setSessions(data || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleAddAvailability = async () => {
    if (!newDate || !newTime) return
    const dateTime = new Date(`${newDate}T${newTime}`)

    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user
    if (!user) return

    const { error } = await supabase.from('sessions').insert({
      coach_id: user.id,
      date: dateTime.toISOString(),
      statut: 'disponible'
    })

    if (!error) {
      setShowAddForm(false)
      setNewDate('')
      setNewTime('')
      window.location.reload()
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(sessions.filter(s => s.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📅 Appointments</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add availability
        </button>
      </header>

      {showAddForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">Add a new slot</h2>
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <button
              onClick={handleAddAvailability}
              className="bg-green-600 text-white px-4 py-1 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : sessions.length > 0 ? (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <li key={s.id} className="p-4 bg-white shadow rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{new Date(s.date).toLocaleString()}</p>
                <p className="text-sm text-gray-600">
                  {s.statut === 'disponible'
                    ? 'Available slot'
                    : `Booked by ${s.client?.email || 'Unknown'}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  )
}
