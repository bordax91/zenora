'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachCalendar({ coachId }) {
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (coachId) fetchSessions()
  }, [coachId])

  const fetchSessions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('coach_id', coachId)
      .eq('statut', 'disponible')
      .order('date', { ascending: true })

    if (error) {
      console.error('❌ fetchSessions error:', error)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }

  // comparer 2 dates (jour UTC)
  const sameUTC = (a, b) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()

  const availableDates = sessions.map(s => new Date(s.date))
  const filteredSessions = sessions.filter(s => sameUTC(new Date(s.date), selectedDate))

  const goReserve = (sessionId) => {
    // on passe par une page dédiée qui gère auth + update + redirection
    router.push(`/reserve?sessionId=${encodeURIComponent(sessionId)}`)
  }

  if (loading) return <p className="text-center py-4 text-gray-600">📅 Chargement du calendrier...</p>

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Disponibilités</h3>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        minDate={new Date()}
        tileDisabled={({ date }) => !availableDates.some(d => sameUTC(d, date))}
      />

      <div className="mt-6">
        <h4 className="font-semibold mb-2">
          Créneaux le {selectedDate.toLocaleDateString('fr-FR')}
        </h4>

        {filteredSessions.length > 0 ? (
          <ul className="space-y-2">
            {filteredSessions.map(session => (
              <li key={session.id} className="flex justify-between items-center border p-3 rounded">
                <span>
                  {new Date(session.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC'
                  })}
                </span>
                <button
                  onClick={() => goReserve(session.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                >
                  Réserver & Payer
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aucun créneau disponible ce jour-là.</p>
        )}
      </div>
    </div>
  )
}
