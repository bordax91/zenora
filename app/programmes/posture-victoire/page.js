'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function PostureVictoire() {
  const [lines, setLines] = useState([])
  const text = [
    "Tiens-toi droit(e), la colonne bien étirée…",
    "Laisse tes épaules se relâcher naturellement…",
    "Relève légèrement ton menton, regarde droit devant toi…",
    "Respire profondément, sens ta poitrine s’ouvrir…",
    "À chaque inspiration, imagine ta puissance grandir…",
    "Sens ta stabilité dans tes pieds…",
    "Ton centre est solide, ancré…",
    "Inspire confiance…",
    "Expire les doutes…",
    "Imagine une lumière dorée émaner de toi…",
    "Elle illumine ton visage, ton cœur, ton esprit…",
    "Cette posture est la tienne : digne, forte, assurée…",
    "Garde cette sensation vivante en toi…",
    "Tu es capable, tu es prêt(e), tu es puissant(e)…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Posture de victoire</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
