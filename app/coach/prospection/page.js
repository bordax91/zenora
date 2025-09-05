'use client'

import { useState } from 'react'

export default function ProspectionPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    industry: '',
    location: '',
    recentActivity: '',
    painPoint: '',
    offer: '',
    platform: 'LinkedIn',
    role: 'coach'
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/prospection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
      }

      setResponse(data.message)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const fieldLabels = {
    firstName: 'Prénom',
    lastName: 'Nom',
    jobTitle: 'Poste',
    industry: 'Secteur',
    location: 'Ville',
    recentActivity: 'Activité récente',
    painPoint: 'Problème identifié',
    offer: 'Offre',
    platform: 'Plateforme',
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">🤖 Générateur de message de prospection IA</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData).map(([key, value]) => (
          key !== 'role' && (
            <div key={key} className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fieldLabels[key] || key}
              </label>
              <input
                name={key}
                value={value}
                onChange={handleChange}
                required={false}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )
        ))}

        <div className="col-span-full">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Génération en cours…' : 'Générer le message'}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm text-center">❌ {error}</p>}

      {response && (
        <div className="mt-6 bg-gray-50 border border-gray-300 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">🎯 Message généré :</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800">{response}</p>
        </div>
      )}
    </div>
  )
}
