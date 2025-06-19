// app/formulaire-coaching/page.js
'use client'

import { useState } from 'react'

export default function FormulaireCoaching() {
  const [form, setForm] = useState({
    raison: '',
    attentes: '',
    theme: '',
    email: ''
  })
  const [envoye, setEnvoye] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetch('/api/send-formulaire', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    })
    setEnvoye(true)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Formulaire de coaching personnalisé</h1>

      {envoye ? (
        <p className="text-green-600 text-center">Merci ! Nous avons bien reçu vos réponses.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Pourquoi souhaitez-vous une séance de coaching ?</label>
            <select
              name="raison"
              value={form.raison}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Choisir une option --</option>
              <option value="stress">Je me sens anxieux.se ou débordé.e</option>
              <option value="relation">Je rencontre des difficultés dans mes relations</option>
              <option value="objectif">Je veux mieux me connaître et fixer des objectifs</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Qu'attendez-vous de votre coach ?</label>
            <select
              name="attentes"
              value={form.attentes}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Choisir une option --</option>
              <option value="ecoute">Qu'il m'écoute et me comprenne</option>
              <option value="outils">Qu'il me donne des outils concrets</option>
              <option value="confiance">Qu'il m'aide à retrouver confiance</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Thématique principale</label>
            <select
              name="theme"
              value={form.theme}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Choisir une option --</option>
              <option value="stress-anxiete">Stress / Anxiété</option>
              <option value="confiance">Confiance en soi</option>
              <option value="sommeil">Sommeil</option>
              <option value="relations">Relations</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Ton adresse e-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
              placeholder="votre@email.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded"
          >
            Envoyer mes réponses
          </button>
        </form>
      )}
    </div>
  )
}
