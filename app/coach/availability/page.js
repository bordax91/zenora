'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function AvailabilityPage() {
  const [disponibilites, setDisponibilites] = useState([])
  const [nouvelleDate, setNouvelleDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('sessions')
        .select('id, date, statut')
        .eq('coach_id', user.id)
        .eq('statut', 'disponible')
        .order('date', { ascending: true })

      if (!error) {
        setDisponibilites(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const ajouterDisponibilite = async () => {
    if (!nouvelleDate) {
      alert('Veuillez choisir une date et une heure')
      return
    }

    const { error } = await supabase.from('sessions').insert({
      coach_id: userId,
      date: nouvelleDate.toISOString(),
      statut: 'disponible'
    })

    if (error) {
      alert('Erreur lors de l’ajout de la disponibilité')
    } else {
      alert('Disponibilité ajoutée')
      setDisponibilites([
        ...disponibilites,
        { id: Date.now(), date: nouvelleDate.toISOString(), statut: 'disponible' }
      ])
      setNouvelleDate(new Date())
    }
  }

  const supprimerDisponibilite = async (id) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) {
      setDisponibilites(disponibilites.filter((d) => d.id !== id))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mes disponibilités</h1>

      {/* Formulaire ajout */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <DatePicker
          selected={nouvelleDate}
          onChange={(date) => setNouvelleDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="Pp"
          className="border p-2 rounded w-full sm:w-auto"
        />
        <button
          onClick={ajouterDisponibilite}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Ajouter
        </button>
      </div>

      {/* Liste des dispos */}
      {loading ? (
        <p>Chargement...</p>
      ) : disponibilites.length > 0 ? (
        <ul className="space-y-3">
          {disponibilites.map((d) => (
            <li
              key={d.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <span>
                {new Date(d.date).toLocaleString('fr-FR', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </span>
              <button
                onClick={() => supprimerDisponibilite(d.id)}
                className="text-red-500 hover:underline"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune disponibilité définie.</p>
      )}
    </div>
  )
}
