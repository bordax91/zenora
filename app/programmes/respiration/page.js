'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function Respiration() {
  const [lines, setLines] = useState([])
  const text = [
    "Installe-toi confortablement…",
    "Ferme doucement les yeux…",
    "Inspire profondément par le nez pendant 4 secondes…",
    "Retiens ton souffle pendant 7 secondes…",
    "Puis expire lentement par la bouche pendant 8 secondes…",
    "Continue ce cycle de respiration calmement…",
    "À chaque inspiration, imagine que tu accueilles la paix…",
    "À chaque expiration, imagine que tu libères toutes tes tensions…",
    "Sens ton corps se relâcher un peu plus à chaque souffle…",
    "Si des pensées surgissent, laisse-les passer comme des nuages…",
    "Reviens doucement à ton souffle…",
    "Inspire profondément…",
    "Retiens…",
    "Expire lentement…",
    "Chaque respiration est une vague de calme…",
    "Ton cœur ralentit…",
    "Ton esprit se clarifie…",
    "Continue encore quelques instants…",
    "Laisse ton souffle t’envelopper comme un cocon de sérénité…",
    "Et lorsque tu es prêt(e), ouvre doucement les yeux…",
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
    }, 2000) // 2 secondes entre chaque ligne
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Respiration 4-7-8</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
