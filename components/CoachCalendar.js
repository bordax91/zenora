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

  const handleClick = (slotId) => {
    const target = `/info-client?availabilityId=${slotId}&package=${packageId}`
    window.location.href = target // 🔁 Toujours rediriger vers /info-client, connecté ou non
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow border p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📆 Sélectionnez la date et l'heure
        </h3>

        {loading ? (
          <p className="text-gray-600">Chargement des créneaux...</p>
        ) : sortedDates.length === 0 ? (
          <p className="text-gray-500">Aucune disponibilité pour le moment.</p>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateStr) => (
              <div key={dateStr} className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="text-lg font-semibold mb-4 text-gray-700">
                  {DateTime.fromISO(dateStr).setLocale('fr').toLocaleString({
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {groupedDates[dateStr].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleClick(slot.id)}
                      className="border border-blue-500 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition"
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
