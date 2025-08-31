'use client'

import { useState } from 'react'

export default function CoachEmailCampaignPage() {
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const res = await fetch('/api/emails/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          subject,
          html: message,
        }),
      })

      if (!res.ok) throw new Error()

      setSuccess(true)
      setRecipient('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setError("❌ Une erreur est survenue lors de l’envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">📢 Envoi d’une campagne email</h1>

      <form onSubmit={handleSend} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📨 Destinataire</label>
          <input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📝 Objet</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Objet de l’email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">💬 Message (HTML autorisé)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="<p>Bienvenue sur Zenora !</p>"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-60 transition"
        >
          {loading ? 'Envoi en cours…' : 'Envoyer l’email'}
        </button>

        {success && <p className="text-green-600 mt-3">✅ Email envoyé avec succès.</p>}
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </form>
    </div>
  )
}
