'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function EcouteActiveInterieure() {
  const [lines, setLines] = useState([])
  const text = [
    "Ferme les yeux tranquillement…",
    "Imagine une conversation paisible avec quelqu’un que tu apprécies…",
    "Vois son visage, ressens sa présence…",
    "Écoute ses paroles sans juger, sans interrompre…",
    "Sois totalement présent(e) à ce qu’il ou elle exprime…",
    "Maintenant, imagine que c’est à ton tour de parler…",
    "Tu exprimes tes émotions librement, en toute sécurité…",
    "Tu es entendu(e), respecté(e), compris(e)…",
    "Sentez cette connexion sincère entre vous…",
    "Inspire profondément cette sensation de compréhension…",
    "Expire toute distance ou malentendu…",
    "La communication vraie commence toujours par une écoute ouverte…"
  ]

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setLines((prev) => [...prev, text[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 2000) // 2 secondes entre chaque phrase
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Écoute active intérieure</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
