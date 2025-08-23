// ✅ Nouveau composant de planification hebdomadaire façon Calendly

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
    await supabase.from('availability_template').delete().eq('coach_id', userId)

    const toInsert = []
    Object.entries(weekTemplate).forEach(([day, slots]) => {
      slots.forEach(({ start_time, end_time }) => {
        toInsert.push({
          coach_id: userId,
          day_of_week: weekdayMap[day],
          start_time,
          end_time
        })
      })
    })

    const { error } = await supabase.from('availability_template').insert(toInsert)
    if (error) return alert('Erreur sauvegarde : ' + error.message)

    const res = await fetch('/api/generate-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })

    if (!res.ok) return alert('Erreur génération')
    alert('Planning sauvegardé et créneaux générés ✅')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🗓️ Planning hebdomadaire</h1>
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
    </div>
  )
}
