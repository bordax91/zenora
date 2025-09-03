'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function LinkedInSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const res = await fetch('/api/phantom/linkedin-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur inconnue')
      }

      setResults(data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">🔍 Recherche LinkedIn (via Phantom)</h1>

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requête LinkedIn
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex : coach business Paris"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-60"
        >
          {loading ? 'Recherche…' : 'Lancer la recherche'}
        </button>

        {error && <p className="text-red-600 mt-3">{error}</p>}
      </form>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">📋 Résultats :</h2>
          <ul className="space-y-2 text-sm">
            {results.map((r, idx) => (
              <li key={idx} className="bg-gray-50 p-3 rounded-lg border">
                <p className="font-medium">{r.name}</p>
                <p className="text-gray-600">{r.title}</p>
                <a href={r.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Voir le profil
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
