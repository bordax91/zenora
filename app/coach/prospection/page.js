'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProspectionPage() {
  const router = useRouter()

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
    role: 'coach',
    customMessage: ''
  })

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState(null)

  // ✅ Vérifie l'accès à la page (connexion + essai ou abonnement)
  useEffect(() => {
    const checkAccess = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return router.push('/login')

      setUserId(user.id)

      const { data: profile, error } = await supabase
        .from('users')
        .select('trial_start, trial_end, is_subscribed')
        .eq('id', user.id)
        .single()

      if (error || !profile) return router.push('/login')

      const now = new Date()
      let trialEnd = profile.trial_end
        ? new Date(profile.trial_end)
        : profile.trial_start
        ? new Date(new Date(profile.trial_start).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null

      const isTrialExpired = trialEnd ? now > trialEnd : true
      const isSubscribed = profile.is_subscribed === true

      if (isTrialExpired && !isSubscribed) {
        router.push('/coach/subscribe')
      }
    }

    checkAccess()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse('')
    setCopied(false)

    try {
      const res = await fetch('/api/prospection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur API')

      setResponse(data.message)

      // 💾 Sauvegarde dans la base
      if (userId) {
        await supabase.from('prospection_messages').insert([
          {
            coach_id: userId,
            message: data.message,
            ...formData,
          },
        ])
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    customMessage: 'Ajout libre (facultatif)'
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">🤖 Générateur de message de prospection IA</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData).map(([key, value]) => (
          key !== 'role' && (
            <div key={key} className={`col-span-1 ${key === 'customMessage' ? 'md:col-span-2' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fieldLabels[key] || key}
              </label>
              {key === 'customMessage' ? (
                <textarea
                  name={key}
                  value={value}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajoutez un angle, un style ou une idée à inclure..."
                />
              ) : (
                <input
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
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
          <p className="whitespace-pre-wrap text-sm text-gray-800 mb-4">{response}</p>
          <button
            onClick={handleCopy}
            className="text-sm text-blue-600 hover:underline"
          >
            {copied ? '✅ Copié !' : '📋 Copier le message'}
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/coach/prospection/history"
          className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg text-sm font-medium"
        >
          📜 Voir l’historique des messages générés
        </Link>
      </div>
    </div>
  )
}
