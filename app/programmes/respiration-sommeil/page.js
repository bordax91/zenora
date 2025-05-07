'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function RespirationSommeil() {
  const [lines, setLines] = useState([])
  const text = [
    "Installe-toi confortablement dans ton lit…",
    "Ferme les yeux et prends une profonde inspiration…",
    "Retiens doucement l’air quelques secondes…",
    "Puis relâche lentement tout l’air par la bouche…",
    "Sens ton corps devenir plus lourd…",
    "Inspire la paix…",
    "Expire les tensions…",
    "À chaque respiration, ton corps se rapproche du sommeil…",
    "Tes épaules s’affaissent doucement…",
    "Tes bras deviennent lourds, inertes…",
    "Tes jambes s’enfoncent doucement dans le lit…",
    "Respire profondément encore quelques instants…",
    "Chaque souffle te guide vers un sommeil profond et réparateur…",
    "Tout est calme… tout est doux…",
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
    }, 2000) // 2 secondes d'intervalle
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Respiration Profonde pour S'endormir</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
