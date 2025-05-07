'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function MeditationSouffle() {
  const [lines, setLines] = useState([])
  const text = [
    "Assieds-toi confortablement, le dos droit mais détendu…",
    "Ferme doucement les yeux…",
    "Prends conscience de ton souffle naturel…",
    "Sens l’air frais qui entre…",
    "Sens l’air tiède qui sort…",
    "Ne cherche pas à contrôler ta respiration…",
    "Observe simplement, avec bienveillance…",
    "Si ton esprit vagabonde, ramène-le doucement à ton souffle…",
    "Inspire…",
    "Expire…",
    "Chaque souffle t’ancre dans le moment présent…",
    "Laisse le rythme naturel de ta respiration t’apaiser…",
    "Tu es exactement là où tu dois être…",
    "Respire, tout simplement…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Méditation du souffle</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
