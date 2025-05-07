'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function BalayageCorporel() {
  const [lines, setLines] = useState([])
  const text = [
    "Allonge-toi ou assieds-toi confortablement…",
    "Ferme doucement les yeux…",
    "Prends une profonde inspiration…",
    "Sens ton corps se déposer dans le support sous toi…",
    "Amène maintenant ton attention sur tes pieds…",
    "Sens-les, puis relâche-les complètement…",
    "Remonte lentement vers tes chevilles, tes mollets…",
    "Relâche doucement toute tension que tu perçois…",
    "Passe à tes genoux, tes cuisses…",
    "Respire profondément en relâchant encore plus…",
    "Détends ton bassin, ton ventre…",
    "Ressens ton dos s’élargir et se relâcher…",
    "Remonte vers ta poitrine, ton cou, ta mâchoire…",
    "Détends ton front, lisse ton visage…",
    "Tout ton corps est maintenant détendu…",
    "Ressens cette sensation d’apaisement rayonner en toi…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Balayage corporel</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
