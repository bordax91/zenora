'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { DateTime } from 'luxon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachCalendar({ coachId, packageId }) {
  const [availabilities, setAvailabilities] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (coachId) {
      fetchAvailabilities()
    }
  }, [coachId])

  const fetchAvailabilities = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_booked', false)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })

    if (!error) setAvailabilities(data || [])
    else console.error('❌ availabilities:', error)
    setLoading(false)
  }

  const sameDay = (a, b) =>
    a.year === b.getFullYear() &&
    a.month === b.getMonth() + 1 &&
    a.day === b.getDate()

  const availableDates = availabilities.map((a) => {
    const parisDate = DateTime.fromISO(a.date, { zone: 'utc' }).setZone('Europe/Paris')
    return new Date(parisDate.year, parisDate.month - 1, parisDate.day)
  })

  const dayAvailabilities = availabilities.filter((a) => {
    const dt = DateTime.fromISO(a.date, { zone: 'utc' }).setZone('Europe/Paris')
    return sameDay(dt, selectedDate)
  })

  const handleClick = async (slot) => {
    const { data: { user } } = await supabase.auth.getUser()
    const target = `/info-client?availabilityId=${slot.id}&package=${packageId}`

    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent(target)}`
    } else {
      // ✅ redirection vers info-client, session sera insérée + Stripe lancé après
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
          tileDisabled={({ date }) =>
            !availableDates.some((d) => sameDay(DateTime.fromJSDate(d), date))
          }
          className="w-full"
        />
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">
          Créneaux le {selectedDate.toLocaleDateString('fr-FR')}
        </h4>

        {dayAvailabilities.length > 0 ? (
          <ul className="space-y-2">
            {dayAvailabilities.map((slot) => {
              const timeParis = DateTime.fromISO(slot.date, { zone: 'utc' }).setZone('Europe/Paris')
              return (
                <li key={slot.id} className="flex justify-between items-center border p-3 rounded">
                  <span>
                    {timeParis.toLocaleString(DateTime.TIME_24_SIMPLE)} {/* Ex : 10:00 */}
                  </span>
                  <button
                    onClick={() => handleClick(slot)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                  >
                    Réserver ce créneau
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-gray-500">Aucun créneau disponible ce jour-là.</p>
        )}
      </div>
    </div>
  )
}
