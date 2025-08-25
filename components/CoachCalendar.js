'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachCalendar({ coachId, packageId }) {
  const [availabilities, setAvailabilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (coachId) fetchAvailabilities()
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

  const groupedDates = availabilities.reduce((acc, slot) => {
    const parisDate = DateTime.fromISO(slot.date, { zone: 'utc' }).setZone('Europe/Paris')
    const dateKey = parisDate.toFormat('yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push({
      id: slot.id,
      time: parisDate.toFormat('HH:mm')
    })
    return acc
  }, {})

  const sortedDates = Object.keys(groupedDates).sort()

  const handleClick = async (slotId) => {
    const { data: { user } } = await supabase.auth.getUser()
    const target = `/info-client?availabilityId=${slotId}&package=${packageId}`

    if (!user) window.location.href = `/login?next=${encodeURIComponent(target)}`
    else window.location.href = target
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Left column - infos du package */}
      <div className="bg-white p-6 rounded-xl shadow w-full md:w-1/3 border">
        <h2 className="text-xl font-bold mb-1">Zenora</h2>
        <p className="text-lg font-semibold text-gray-800">30 Minute Meeting</p>
        <p className="text-sm text-gray-500 mt-2">🕒 30 minutes</p>
        <p className="text-sm text-gray-500 mt-4">
          Informations sur la conférence en ligne fournies à la confirmation.
        </p>
        <p className="text-sm text-gray-400 mt-6">
          Fuseau horaire : {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
      </div>

      {/* Right column - créneaux */}
      <div className="bg-white p-6 rounded-xl shadow w-full md:w-2/3 border">
        <h3 className="text-2xl font-bold mb-6">📆 Sélectionnez la date et l'heure</h3>

        {loading ? (
          <p className="text-gray-600">Chargement des créneaux...</p>
        ) : sortedDates.length === 0 ? (
          <p className="text-gray-500">Aucune disponibilité pour le moment.</p>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateStr) => (
              <div key={dateStr} className="border p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">
                  {DateTime.fromISO(dateStr).setLocale('fr').toLocaleString({
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {groupedDates[dateStr].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleClick(slot.id)}
                      className="border border-blue-500 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
