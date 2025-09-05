// ✅ Composant de planification hebdomadaire + calendrier de visualisation des disponibilités

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
  const [slotDuration, setSlotDuration] = useState(60)
  const [availabilities, setAvailabilities] = useState([])

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

    const fetchAvailabilities = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data } = await supabase
        .from('availabilities')
        .select('*')
        .eq('coach_id', user.id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })

      setAvailabilities(data || [])
    }

    fetchData()
    fetchAvailabilities()
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
    await supabase.from('availability_template').delete().eq('coach_id', userId)

    const toInsertTemplate = []
    const toInsertSlots = []
    const now = DateTime.now().setZone('Europe/Paris').startOf('day')

    Object.entries(weekTemplate).forEach(([day, slots]) => {
      const dayOfWeek = weekdayMap[day]

      slots.forEach(({ start_time, end_time }) => {
        toInsertTemplate.push({ coach_id: userId, day_of_week: dayOfWeek, start_time, end_time })

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

            toInsertSlots.push({ coach_id: userId, date: slotDate, is_booked: false })
            cursor = cursor.plus({ minutes: slotDuration })
          }
        }
      })
    })

    const { error: templateError } = await supabase
      .from('availability_template')
      .insert(toInsertTemplate)
    if (templateError) return alert('Erreur template : ' + templateError.message)

    const nowUTC = DateTime.now().setZone('Europe/Paris').toUTC().toISO()
    await supabase.from('availabilities').delete().lt('date', nowUTC).eq('is_booked', false)

    const { error: slotError } = await supabase
      .from('availabilities')
      .insert(toInsertSlots)
    if (slotError) return alert('Erreur créneaux : ' + slotError.message)

    alert('Planning sauvegardé et créneaux générés ✅\n\n⏳ Pensez à regénérer toutes les 2 semaines !')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🗓️ Planning hebdomadaire</h1>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Durée des créneaux (en minutes)</label>
        <select
          className="border p-2 rounded"
          value={slotDuration}
          onChange={(e) => setSlotDuration(Number(e.target.value))}
        >
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-6">
          {weekdays.map(day => (
            <div key={day} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">{day}</h2>
              {(weekTemplate[day] || []).map((slot, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input type="time" value={slot.start_time} onChange={(e) => handleTimeChange(day, i, 'start_time', e.target.value)} className="border p-2 rounded" />
                  <span>-</span>
                  <input type="time" value={slot.end_time} onChange={(e) => handleTimeChange(day, i, 'end_time', e.target.value)} className="border p-2 rounded" />
                  <button onClick={() => removeTimeSlot(day, i)} className="text-red-500 hover:underline text-sm">Supprimer</button>
                </div>
              ))}
              <button onClick={() => addTimeSlot(day)} className="text-blue-600 hover:underline text-sm">➕ Ajouter une plage</button>
            </div>
          ))}
          <button onClick={saveTemplate} className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">💾 Enregistrer le planning & générer</button>
        </div>
      )}

      {/* 📅 Calendrier des créneaux générés */}
      <div className="mt-16">
        <h2 className="text-xl font-bold mb-4">📆 Créneaux disponibles</h2>
        {availabilities.length === 0 ? (
          <p className="text-gray-500">Aucun créneau généré pour les 2 prochaines semaines.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(
              availabilities.reduce((acc, slot) => {
                const date = new Date(slot.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'short'
                })
                if (!acc[date]) acc[date] = []
                acc[date].push(slot)
                return acc
              }, {})
            ).map(([date, slots]) => (
              <div key={date} className="bg-white rounded shadow p-4">
                <h3 className="font-semibold mb-2">{date}</h3>
                <ul className="space-y-1 text-sm">
                  {slots.map((slot) => (
                    <li
                      key={slot.date}
                      className={`px-3 py-1 rounded ${
                        slot.is_booked
                          ? 'bg-red-100 text-red-700 line-through'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {new Date(slot.date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
