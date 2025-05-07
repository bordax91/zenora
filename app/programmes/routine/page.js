'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function RoutineDeconnexion() {
  const [lines, setLines] = useState([])
  const text = [
    "Installe-toi confortablement dans ton lit…",
    "Sens ton corps se poser doucement sur le matelas…",
    "Ferme lentement les yeux…",
    "Prends une grande inspiration…",
    "Et expire profondément en relâchant toutes les tensions…",
    "Sens la lourdeur qui s’installe doucement dans ton corps…",
    "Tes pieds se détendent…",
    "Tes jambes deviennent lourdes…",
    "Tes hanches s’abandonnent au matelas…",
    "Ton ventre se relâche…",
    "Ton dos s’étale doucement…",
    "Tes bras deviennent lourds à leur tour…",
    "Ton visage se détend, tes mâchoires se desserrent…",
    "Il n’y a plus rien à faire maintenant…",
    "Laisse la lourdeur du sommeil t’envelopper…",
    "Laisse-toi glisser vers le repos…",
    "Tout est bien…",
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Routine de Déconnexion</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
