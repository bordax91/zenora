'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function AncragePresent() {
  const [lines, setLines] = useState([])
  const text = [
    "Ferme doucement les yeux…",
    "Prends une profonde inspiration…",
    "Expire lentement, relâchant toute tension…",
    "Concentre-toi sur les sensations de ton corps…",
    "Sens tes pieds posés sur le sol, solides…",
    "Ressens la stabilité de ton bassin sur ton siège…",
    "Sens l'air frais qui entre par ton nez…",
    "Sens l'air tiède qui ressort doucement…",
    "Pose ta main sur ton cœur…",
    "Ressens son rythme calme et régulier…",
    "Dis-toi intérieurement : 'Ici et maintenant, tout va bien.'",
    "Inspire profondément, laisse la paix t'envahir…",
    "Expire toute inquiétude ou pensée envahissante…",
    "Reste dans cette sensation de présence encore quelques instants…",
    "Quand tu seras prêt(e), ouvre doucement les yeux…"
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
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Ancrage dans le présent</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
