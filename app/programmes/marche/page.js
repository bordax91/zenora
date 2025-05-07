'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function MarcheConsciente() {
  const [lines, setLines] = useState([])
  const text = [
    "Si tu le peux, lève-toi doucement…",
    "Pose ton attention sur ton corps…",
    "Sens le poids de ton corps sur tes pieds…",
    "Avance lentement, un pas après l’autre…",
    "Ressens la texture du sol sous tes pieds…",
    "À chaque pas, dis-toi : “Je suis ici”…",
    "Inspire profondément, expire lentement…",
    "Marche avec conscience, sans but particulier…",
    "Laisse ton esprit s’ancrer dans le moment présent…",
    "Si des pensées apparaissent, accueille-les sans jugement…",
    "Puis ramène doucement ton attention à ta marche…",
    "Respire, avance, ressens…",
    "Marche comme si chaque pas massait la terre sous toi…",
    "Tu es connecté(e) au sol, au moment, à toi-même…",
    "Continue ainsi encore quelques instants…",
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Marche consciente</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
