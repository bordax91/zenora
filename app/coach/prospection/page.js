'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LinkedInSearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [limitReached, setLimitReached] = useState(false)
  const [searchCount, setSearchCount] = useState(0)

  const DAILY_LIMIT = 10
  const STORAGE_KEY = 'linkedin_searches_today'

  // Chargement au montage : vérifie les recherches du jour
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    const count = stored[today] || 0

    setSearchCount(count)
    if (count >= DAILY_LIMIT) setLimitReached(true)
  }, [])

  // Incrémente le compteur localStorage
  const incrementSearchCount = () => {
    const today = new Date().toISOString().split('T')[0]
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    const current = stored[today] || 0
    stored[today] = current + 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    setSearchCount(current + 1)
    if (current + 1 >= DAILY_LIMIT) setLimitReached(true)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (limitReached) return

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

      if (!res.ok) throw new Error('Erreur de récupération des résultats')
      const data = await res.json()

      setResults(data.results || [])
      incrementSearchCount()
    } catch (err) {
      setError('❌ Une erreur est survenue.')
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
            Requête LinkedIn (ex : coach sportif Paris)
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            disabled={limitReached}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Ex : coach business Paris"
          />
        </div>

        <button
          type="submit"
          disabled={loading || limitReached}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-60"
        >
          {loading ? 'Recherche…' : 'Lancer la recherche'}
        </button>

        <p className="text-sm text-gray-500 mt-2">
          🔄 {searchCount}/{DAILY_LIMIT} recherches aujourd’hui
        </p>

        {limitReached && (
          <p className="text-red-600 text-sm mt-2">
            ⛔ Limite quotidienne atteinte. Réessayez demain.
          </p>
        )}

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
                <p className="text-blue-600 text-sm">
                  <a href={r.profileUrl} target="_blank" rel="noopener noreferrer">
                    Voir le profil
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
