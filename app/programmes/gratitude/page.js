'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function Gratitude() {
  const [lines, setLines] = useState([])
  const text = [
    "Ferme doucement les yeux…",
    "Inspire profondément, expire lentement…",
    "Amène dans ton cœur une pensée de gratitude…",
    "Pense à une personne qui t’apporte de la joie…",
    "Remercie-la intérieurement…",
    "Pense à un moment heureux vécu récemment…",
    "Ressens la chaleur de ce souvenir…",
    "Pense à un aspect de toi que tu apprécies…",
    "Remercie-toi pour tout ce que tu es déjà…",
    "Chaque souffle nourrit cette sensation de gratitude…",
    "Ton cœur s’élargit doucement…",
    "Ressens cette vibration positive rayonner en toi…",
    "Emporte cette énergie de gratitude avec toi…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Moment de gratitude</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
