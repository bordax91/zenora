'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const localizer = momentLocalizer(moment)

export default function CoachCalendar({ coachId }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('coach_id', coachId)

    if (error) {
      console.error(error)
      return
    }

    // Convertir les sessions en format "events" pour react-big-calendar
    const formatted = data.map(session => ({
      id: session.id,
      title: session.statut === 'reservé' ? 'Réservé' : 'Disponible',
      start: new Date(session.date),
      end: new Date(new Date(session.date).getTime() + 60 * 60 * 1000), // +1h
      allDay: false
    }))

    setEvents(formatted)
  }

  const handleSelectSlot = async ({ start }) => {
    // Création d’un créneau dispo
    const { error } = await supabase.from('sessions').insert([
      {
        coach_id: coachId,
        date: start,
        statut: 'disponible'
      }
    ])
    if (!error) {
      fetchSessions()
    }
  }

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        selectable
        onSelectSlot={handleSelectSlot}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        messages={{
          today: 'Aujourd\'hui',
          previous: 'Précédent',
          next: 'Suivant',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour'
        }}
      />
    </div>
  )
}
