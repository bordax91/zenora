'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DateTime } from 'luxon'

export default function AvailabilityPage() {
  const [template, setTemplate] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [weekday, setWeekday] = useState('Lundi')
  const [startTime, setStartTime] = useState('10:00')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

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

  const fetchAvailabilities = async (uid) => {
    const { data: slotsData } = await supabase
      .from('availabilities')
      .select('*')
      .eq('coach_id', uid)
      .eq('is_booked', false)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })

    setAvailabilities(slotsData || [])
  }

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

      setTemplate(templateData || [])
      await fetchAvailabilities(user.id)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleAddTemplate = async () => {
    if (!weekday || !startTime) return alert('Champs requis')
    const dayOfWeek = weekdayMap[weekday]
    const endTime = addOneHour(startTime)

    const { error } = await supabase.from('availability_template').insert({
      coach_id: userId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime
    })

    if (error) return alert("Erreur ajout : " + error.message)

    setTemplate([...template, {
      coach_id: userId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime
    }])

    const res = await fetch('/api/generate-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })

    if (!res.ok) {
      const err = await res.json()
      return alert('Erreur génération : ' + (err?.error || ''))
    }

    await fetchAvailabilities(userId)
    alert('Disponibilité ajoutée et créneaux générés ✅')
  }

  const handleGenerateSlots = async () => {
    const res = await fetch('/api/generate-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })

    if (res.ok) {
      await fetchAvailabilities(userId)
      alert('Créneaux générés ✅')
    } else {
      const error = await res.json()
      alert('Erreur génération : ' + (error?.error || ''))
    }
  }

  const deleteSlot = async (id) => {
    const { error } = await supabase.from('availabilities').delete().eq('id', id)
    if (!error) setAvailabilities(availabilities.filter(a => a.id !== id))
  }

  const addOneHour = (start) => {
    const [h, m] = start.split(':').map(Number)
    const date = new Date()
    date.setHours(h + 1, m)
    return date.toTimeString().slice(0, 5)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🗓 Disponibilités</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">➕ Ajouter une disponibilité récurrente</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={weekday} onChange={(e) => setWeekday(e.target.value)} className="border p-2 rounded">
            {weekdays.map((d) => <option key={d}>{d}</option>)}
          </select>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border p-2 rounded" />
          <button onClick={handleAddTemplate} className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
        </div>
      </div>

      <div className="mb-6">
        <button onClick={handleGenerateSlots} className="bg-green-600 text-white px-4 py-2 rounded">
          🔄 Générer mes créneaux (14 jours)
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-2">📅 Créneaux à venir</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : availabilities.length > 0 ? (
        <ul className="space-y-3">
          {availabilities.map((a) => (
            <li key={a.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <span>
                {
                  DateTime.fromISO(a.date, { zone: 'utc' })
                    .setZone('Europe/Paris')
                    .toFormat("cccc d LLLL yyyy 'à' HH'h'mm")
                }
              </span>
              <button onClick={() => deleteSlot(a.id)} className="text-red-500 hover:underline">Supprimer</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun créneau disponible.</p>
      )}
    </div>
  )
}
