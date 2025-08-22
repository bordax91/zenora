'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function AvailabilityPage() {
  const [template, setTemplate] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [weekday, setWeekday] = useState('Monday')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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

      const { data: slotsData } = await supabase
        .from('availabilities')
        .select('*')
        .eq('coach_id', user.id)
        .eq('is_booked', false)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })

      setTemplate(templateData || [])
      setAvailabilities(slotsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleAddTemplate = async () => {
    if (!weekday || !startTime || !endTime) return alert('Champs requis')
    const { error } = await supabase.from('availability_template').insert({
      coach_id: userId,
      weekday,
      start_time: startTime,
      end_time: endTime,
    })
    if (error) return alert('Erreur ajout')
    setTemplate([...template, { weekday, start_time: startTime, end_time: endTime }])
  }

  const handleGenerateSlots = async () => {
    const res = await fetch('/api/generate-availability', { method: 'POST' })
    if (res.ok) {
      alert('Créneaux générés')
      location.reload()
    } else {
      alert('Erreur génération')
    }
  }

  const deleteSlot = async (id) => {
    const { error } = await supabase.from('availabilities').delete().eq('id', id)
    if (!error) setAvailabilities(availabilities.filter(a => a.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🗓 Disponibilités</h1>

      {/* Formulaire ajout template */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">➕ Ajouter une disponibilité récurrente</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={weekday} onChange={(e) => setWeekday(e.target.value)} className="border p-2 rounded">
            {weekdays.map((d) => <option key={d}>{d}</option>)}
          </select>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border p-2 rounded" />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border p-2 rounded" />
          <button onClick={handleAddTemplate} className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
        </div>
      </div>

      {/* Bouton génération */}
      <div className="mb-6">
        <button onClick={handleGenerateSlots} className="bg-green-600 text-white px-4 py-2 rounded">
          🔄 Générer mes créneaux (14 jours)
        </button>
      </div>

      {/* Créneaux à venir */}
      <h2 className="text-lg font-semibold mb-2">📅 Créneaux à venir</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : availabilities.length > 0 ? (
        <ul className="space-y-3">
          {availabilities.map((a) => (
            <li key={a.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <span>{new Date(a.date).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</span>
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
