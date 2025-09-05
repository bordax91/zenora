'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProspectionHistoryPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('prospection_messages')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setMessages(data)
      setLoading(false)
    }

    fetchUserAndMessages()
  }, [])

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">📜 Historique des messages générés</h1>

      {loading && <p className="text-center">Chargement...</p>}

      {!loading && messages.length === 0 && (
        <p className="text-center text-gray-500">Aucun message généré pour l'instant.</p>
      )}

      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div key={msg.id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <p className="text-sm whitespace-pre-wrap text-gray-800 mb-2">{msg.message}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{new Date(msg.created_at).toLocaleString()}</span>
              <button onClick={() => handleCopy(msg.message, index)} className="text-blue-600 hover:underline">
                {copiedIndex === index ? '✅ Copié' : '📋 Copier'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
