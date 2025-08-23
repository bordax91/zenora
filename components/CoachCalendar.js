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
  const [availabilities, setAvailabilities] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
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

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const availableDates = availabilities.map((a) => {
    const localDate = new Date(a.date)
    return new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate())
  })

  const dayAvailabilities = availabilities.filter((a) => {
    const date = new Date(a.date)
    return sameDay(date, selectedDate)
  })

  const handleClick = async (slot) => {
    const { data: { user } } = await supabase.auth.getUser()
    const target = `/info-client?availabilityId=${slot.id}&package=${packageId}`

    if (!user) {
      // Redirection vers login avec redirection automatique après identification
      window.location.href = `/login?next=${encodeURIComponent(target)}`
    } else {
      // ✅ Créer une session dès maintenant si l'utilisateur est déjà connecté
      const { data, error } = await supabase.from('sessions').insert({
        coach_id: coachId,
        client_id: user.id,
        date: slot.date,
        package_id: packageId,
        availability_id: slot.id,
        statut: 'réservé' // ✅ Ajout du statut
      }).select().single()

      if (error) {
        alert('Erreur lors de la réservation : ' + error.message)
        return
      }

      // ✅ Marquer l’availability comme réservée
      await supabase
        .from('availabilities')
        .update({ is_booked: true })
        .eq('id', slot.id)

      // ✅ Redirection vers le formulaire (où Stripe prendra la suite)
      window.location.href = `/info-client?availabilityId=${slot.id}&package=${packageId}&session=${data.id}`
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
          tileDisabled={({ date }) => !availableDates.some(d => sameDay(d, date))}
          className="w-full"
        />
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">
          Créneaux le {selectedDate.toLocaleDateString('fr-FR')}
        </h4>

        {dayAvailabilities.length > 0 ? (
          <ul className="space-y-2">
            {dayAvailabilities.map(slot => (
              <li key={slot.id} className="flex justify-between items-center border p-3 rounded">
                <span>
                  {new Date(slot.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </span>
                <button
                  onClick={() => handleClick(slot)}
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
