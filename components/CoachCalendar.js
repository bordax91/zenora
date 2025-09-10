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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow border p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📆 Sélectionnez une date et un créneau horaire
        </h3>

        {loading ? (
          <p className="text-gray-600">Chargement des créneaux...</p>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
            {/* 📅 Calendrier */}
            <div className="flex justify-center md:block">
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
                  available: 'bg-blue-100 text-blue-800 font-semibold',
                  selected: 'bg-blue-500 text-white'
                }}
                disabled={{
                  before: new Date(),
                  day: (date) => {
                    const dateStr = DateTime.fromJSDate(date).toISODate()
                    return !(dateStr in slotsByDate)
                  }
                }}
                className="w-full max-w-xs"
              />
            </div>

            {/* ⏰ Créneaux horaires */}
            <div className="w-full">
              {selectedDate ? (
                selectedSlots.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleTimeClick(slot.id)}
                        className="block w-full text-left border border-blue-500 text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition"
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun créneau disponible ce jour-là.</p>
                )
              ) : (
                <p className="text-gray-500">Veuillez choisir une date.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
