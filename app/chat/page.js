'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase/client'

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Bonjour et bienvenue chez Zenora. 🌿 Comment te sens-tu aujourd\'hui ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { sender: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      const data = await res.json()

      const botMessage = { sender: 'bot', text: data.response }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Erreur:', error)
      setMessages(prev => [...prev, { sender: 'bot', text: 'Désolé, une erreur est survenue.' }])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                msg.sender === 'user' ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="mr-auto bg-gray-100 text-gray-800 max-w-[80%] px-4 py-3 rounded-2xl text-sm">
              Zenora est en train de répondre...
            </div>
          )}
        </div>

        <div className="mt-6 w-full max-w-2xl flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Exprime-toi librement..."
            className="flex-1 px-4 py-3 border rounded-lg shadow focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
            disabled={loading}
          >
            Envoyer
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Ce chatbot est une IA de soutien émotionnel, pas un professionnel de santé mentale.
        </p>
      </main>
    </div>
  )
}
