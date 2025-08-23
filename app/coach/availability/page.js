// ✅ Nouveau composant de planification hebdomadaire façon Calendly avec durée personnalisable

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DateTime } from 'luxon'

const weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const weekdayMap = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 0
}

export default function WeeklyAvailability() {
  const [weekTemplate, setWeekTemplate] = useState({})
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [slotDuration, setSlotDuration] = useState(60) // minutes

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return
      setUserId(user.id)

      const { data: templateData } = await supabase
        .from('availability_template')
        .select('*')
        .eq('coach_id', user.id)

      const byDay = {}
      templateData?.forEach(({ day_of_week, start_time, end_time }) => {
        const dayName = weekdays.find(d => weekdayMap[d] === day_of_week)
        if (!byDay[dayName]) byDay[dayName] = []
        byDay[dayName].push({ start_time, end_time })
      })

      setWeekTemplate(byDay)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleTimeChange = (day, index, field, value) => {
    setWeekTemplate(prev => {
      const newDay = [...(prev[day] || [])]
      newDay[index][field] = value
      return { ...prev, [day]: newDay }
    })
  }

  const addTimeSlot = (day) => {
    setWeekTemplate(prev => {
      const newSlots = [...(prev[day] || []), { start_time: '09:00', end_time: '10:00' }]
      return { ...prev, [day]: newSlots }
    })
  }

  const removeTimeSlot = (day, index) => {
    setWeekTemplate(prev => {
      const newSlots = [...(prev[day] || [])]
      newSlots.splice(index, 1)
      return { ...prev, [day]: newSlots }
    })
  }

  const saveTemplate = async () => {
    if (!userId) return

    // 1. Supprimer anciens templates
    await supabase.from('availability_template').delete().eq('coach_id', userId)

    const toInsertTemplate = []
    const toInsertSlots = []
    const now = DateTime.now().setZone('Europe/Paris').startOf('day')

    Object.entries(weekTemplate).forEach(([day, slots]) => {
      const dayOfWeek = weekdayMap[day]

      slots.forEach(({ start_time, end_time }) => {
        // Enregistrement du template
        toInsertTemplate.push({
          coach_id: userId,
          day_of_week: dayOfWeek,
          start_time,
          end_time
        })

        // Génération des créneaux sur 14 jours
        for (let i = 0; i < 14; i++) {
          const currentDay = now.plus({ days: i })
          if (currentDay.weekday % 7 !== dayOfWeek) continue

          const start = DateTime.fromFormat(start_time, 'HH:mm', { zone: 'Europe/Paris' })
          const end = DateTime.fromFormat(end_time, 'HH:mm', { zone: 'Europe/Paris' })
          let cursor = start

          while (cursor.plus({ minutes: slotDuration }) <= end) {
            const slotDate = currentDay
              .set({ hour: cursor.hour, minute: cursor.minute })
              .toUTC()
              .toISO()

            toInsertSlots.push({
              coach_id: userId,
              date: slotDate,
              is_booked: false
            })

            cursor = cursor.plus({ minutes: slotDuration })
          }
        }
      })
    })

    // Enregistrement
    const { error: templateError } = await supabase
      .from('availability_template')
      .insert(toInsertTemplate)
    if (templateError) return alert('Erreur template : ' + templateError.message)

    // Suppression anciens créneaux
    const nowUTC = DateTime.now().setZone('Europe/Paris').toUTC().toISO()
    await supabase.from('availabilities').delete().lt('date', nowUTC).eq('is_booked', false)

    // Insertion créneaux
    const { error: slotError } = await supabase
      .from('availabilities')
      .insert(toInsertSlots)
    if (slotError) return alert('Erreur créneaux : ' + slotError.message)

    alert('Planning sauvegardé et créneaux générés ✅\n→ Pensez à regénérer toutes les 2 semaines !')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
