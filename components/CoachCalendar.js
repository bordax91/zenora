'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CoachCalendar({ coachId }) {
  const [sessions, setSessions] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [clientId, setClientId] = useState(null)

  // 🔹 Récupérer les sessions visibles à tous
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
      console.error('❌ Erreur récupération sessions :', error)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }

  // 🔹 Vérifie l'utilisateur au moment de cliquer
  const checkClientAndReserve = async (session) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error } = await supabase
      .from('sessions')
      .update({
        client_id: user.id,
        statut: 'réservé'
      })
      .eq('id', session.id)

    if (error) {
      console.error('❌ Erreur réservation :', error)
      alert('Une erreur est survenue.')
    } else {
      if (session.payment_link) {
        window.location.href = session.payment_link
      } else {
        alert('Réservation confirmée ✅')
        fetchSessions()
      }
    }
  }

  // 🔹 Compare deux dates en UTC sans tenir compte de l'heure
  const isSameUTCDate = (d1, d2) =>
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()

  // 🔹 Dates disponibles (à colorer dans le calendrier)
  const availableDates = sessions.map(s => new Date(s.date))

  // 🔹 Créneaux pour le jour sélectionné
  const filteredSessions = sessions.filter(s =>
    isSameUTCDate(new Date(s.date), selectedDate)
  )

  if (loading) {
    return <p className="text-center py-4 text-gray-600">📅 Chargement du calendrier...</p>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Disponibilités</h3>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        minDate={new Date()}
        tileDisabled={({ date }) =>
          !availableDates.some(d => isSameUTCDate(d, date))
        }
      />

      <div className="mt-6">
        <h4 className="font-semibold mb-2">
          Créneaux le {selectedDate.toLocaleDateString('fr-FR')}
        </h4>

        {filteredSessions.length > 0 ? (
          <ul className="space-y-2">
            {filteredSessions.map(session => (
              <li
                key={session.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span>
                  {new Date(session.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC'
                  })}
                </span>
                <button
                  onClick={() => checkClientAndReserve(session)}
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
