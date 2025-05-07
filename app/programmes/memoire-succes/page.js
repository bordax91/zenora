'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function MemoireSucces() {
  const [lines, setLines] = useState([])
  const text = [
    "Ferme les yeux doucement…",
    "Replonge dans un souvenir positif…",
    "Un moment où tu as accompli quelque chose d’important pour toi…",
    "Visualise cet instant : où étais-tu ?",
    "Que ressentais-tu ?",
    "Vois les couleurs, entends les sons, ressens les émotions…",
    "Sens la fierté gonfler ton cœur…",
    "Remémore-toi tous les efforts fournis pour y parvenir…",
    "Prends quelques respirations dans cette sensation de réussite…",
    "Réalise que cette force est toujours en toi…",
    "Tu peux à nouveau réussir, avancer, triompher…",
    "Emporte ce souvenir avec toi comme une ancre de confiance…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Mémoire d'un succès</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
