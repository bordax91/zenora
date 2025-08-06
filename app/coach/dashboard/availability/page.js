'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AvailabilityPage() {
  const [disponibilites, setDisponibilites] = useState([])
  const [nouvelleDate, setNouvelleDate] = useState('')
  const [nouvelleHeure, setNouvelleHeure] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return
      setUserId(user.id)

      // Charger les disponibilités existantes
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
    if (!nouvelleDate || !nouvelleHeure) {
      alert('Veuillez choisir une date et une heure')
      return
    }

    const dateTime = new Date(`${nouvelleDate}T${nouvelleHeure}`)

    const { error } = await supabase.from('sessions').insert({
      coach_id: userId,
      date: dateTime.toISOString(),
      statut: 'disponible'
    })

    if (error) {
      alert('Erreur lors de l’ajout de la disponibilité')
    } else {
      alert('Disponibilité ajoutée')
      setDisponibilites([
        ...disponibilites,
        { id: Date.now(), date: dateTime.toISOString(), statut: 'disponible' }
      ])
      setNouvelleDate('')
      setNouvelleHeure('')
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
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="date"
          value={nouvelleDate}
          onChange={(e) => setNouvelleDate(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          type="time"
          value={nouvelleHeure}
          onChange={(e) => setNouvelleHeure(e.target.value)}
          className="border p-2 rounded flex-1"
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
