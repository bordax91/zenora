'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function VisualisationApaisante() {
  const [lines, setLines] = useState([])
  const text = [
    "Installe-toi confortablement…",
    "Ferme doucement les yeux…",
    "Prends une inspiration profonde…",
    "Imagine au-dessus de toi une lumière douce, dorée…",
    "Cette lumière descend lentement sur ton front…",
    "Elle détend ta mâchoire, ton cou…",
    "Elle glisse sur tes épaules, ton dos, ton ventre…",
    "À chaque zone touchée, elle relâche toutes tensions…",
    "Sens cette lumière chaleureuse réchauffer ton cœur…",
    "Inspire cette lumière en toi…",
    "Expire doucement, relâchant tout ce qui pèse…",
    "Imagine ton corps s’illuminer de calme et de sérénité…",
    "Ressens comme ta respiration devient plus profonde, plus lente…",
    "Reste quelques instants dans cette sensation d’apaisement…",
    "Lorsque tu es prêt(e), reviens doucement dans l’instant présent…",
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Visualisation Apaisante</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
