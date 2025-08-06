'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

// 📌 Config Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CoachCalendar({ coachId }) {
  const [sessions, setSessions] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (coachId) {
      fetchSessions()
    }
  }, [coachId])

  // 📌 Récupération des créneaux du coach
  const fetchSessions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('coach_id', coachId)
      .order('date', { ascending: true })

    if (error) {
      console.error('❌ Erreur récupération sessions :', error)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }

  // 📌 Normalisation des dates dispo (sans fuseau)
  const availableDates = sessions.map(s => {
    const d = new Date(s.date)
    return d.toISOString().split('T')[0] // format YYYY-MM-DD
  })

  // 📌 Sessions du jour sélectionné
  const filteredSessions = sessions.filter(s => {
    const d1 = new Date(s.date).toISOString().split('T')[0]
    const d2 = selectedDate.toISOString().split('T')[0]
    return d1 === d2
  })

  if (loading) {
    return <p className="text-center py-4 text-gray-600">📅 Chargement du calendrier...</p>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Disponibilités</h3>

      {/* 📆 Calendrier */}
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        minDate={new Date()}
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split('T')[0]
          return availableDates.includes(dateStr)
            ? 'bg-green-100' // date dispo
            : 'text-gray-400' // date sans dispo (mais cliquable)
        }}
      />

      {/* ⏱ Liste des créneaux */}
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
                    minute: '2-digit'
                  })}
                </span>

                {session.statut === 'réservé' ? (
                  <span className="text-red-500 font-medium">Réservé</span>
                ) : (
                  session.payment_link && (
                    <a
                      href={session.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                    >
                      Réserver & Payer
                    </a>
                  )
                )}
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
