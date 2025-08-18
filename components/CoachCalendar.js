'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachCalendar({ coachId, packageId }) {
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
      .is('client_id', null) // ✅ MODIFICATION ICI
      .order('date', { ascending: true })

    if (!error) setSessions(data || [])
    else console.error('❌ sessions:', error)
    setLoading(false)
  }

  const sameUTC = (a, b) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()

  const availableDates = sessions.map(s => new Date(s.date))
  const daySessions = sessions.filter(s => sameUTC(new Date(s.date), selectedDate))

  const handleClick = async (session) => {
    const { data: { user } } = await supabase.auth.getUser()
    const target = `/info-client?session=${session.id}&package=${packageId}`

    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent(target)}`
    } else {
      window.location.href = target
    }
  }

  if (loading) return <p className="text-center py-4 text-gray-600">📅 Chargement du calendrier...</p>

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow w-full">
      <h3 className="text-lg font-semibold mb-4">Disponibilités</h3>

      <div className="w-full overflow-auto">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          minDate={new Date()}
          tileDisabled={({ date }) => !availableDates.some(d => sameUTC(d, date))}
          className="w-full"
        />
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">
          Créneaux le {selectedDate.toLocaleDateString('fr-FR')}
        </h4>

        {daySessions.length > 0 ? (
          <ul className="space-y-2">
            {daySessions.map(s => (
              <li key={s.id} className="flex justify-between items-center border p-3 rounded">
                <span>
                  {new Date(s.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC',
                  })}
                </span>
                <button
                  onClick={() => handleClick(s)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                >
                  Réserver ce créneau
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
