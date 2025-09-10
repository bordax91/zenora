'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { fr } from 'date-fns/locale'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachCalendar({ coachId, packageId }) {
  const [availabilities, setAvailabilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)

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
    else console.error('❌ Erreur chargement des disponibilités :', error)

    setLoading(false)
  }

  const slotsByDate = availabilities.reduce((acc, slot) => {
    const parisDate = DateTime.fromISO(slot.date, { zone: 'utc' }).setZone('Europe/Paris')
    const dateKey = parisDate.toISODate()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push({
      id: slot.id,
      time: parisDate.toFormat('HH:mm')
    })
    return acc
  }, {})

  const availableDates = Object.keys(slotsByDate).map((dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  })

  const selectedSlots = selectedDate
    ? slotsByDate[DateTime.fromJSDate(selectedDate).toISODate()] || []
    : []

  const handleTimeClick = (slotId) => {
    window.location.href = `/info-client?availabilityId=${slotId}&package=${packageId}`
  }

  return (
    <div className="max-w-md mx-auto px-1 py-4">
      <div className="bg-white rounded-lg shadow border p-3">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          📅 Sélectionnez une date et un horaire
        </h3>

        {loading ? (
          <p className="text-gray-600 text-sm">Chargement...</p>
        ) : (
          <>
            {/* 📅 Calendrier */}
            <div className="w-full flex justify-center mb-4">
              <div className="w-full max-w-[320px]">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={fr}
                  weekStartsOn={1}
                  modifiers={{
                    available: availableDates
                  }}
                  modifiersClassNames={{
                    available: 'bg-blue-100 text-blue-800 font-medium',
                    selected: 'bg-blue-500 text-white'
                  }}
                  disabled={{
                    before: new Date(),
                    day: (date) => {
                      const dateStr = DateTime.fromJSDate(date).toISODate()
                      return !(dateStr in slotsByDate)
                    }
                  }}
                  className="w-full text-sm"
                />
              </div>
            </div>

            {/* ⏰ Créneaux horaires */}
            <div className="w-full">
              {selectedDate ? (
                selectedSlots.length > 0 ? (
                  <div className="space-y-1">
                    {selectedSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleTimeClick(slot.id)}
                        className="block w-full text-left border border-blue-500 text-blue-600 font-medium py-1.5 px-2 rounded-md hover:bg-blue-50 transition text-sm"
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun créneau ce jour-là.</p>
                )
              ) : (
                <p className="text-gray-500 text-sm">Veuillez choisir une date.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
