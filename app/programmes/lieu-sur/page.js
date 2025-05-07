'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function LieuSur() {
  const [lines, setLines] = useState([])
  const text = [
    "Ferme doucement les yeux…",
    "Prends une profonde inspiration…",
    "Imagine un lieu où tu te sens totalement en sécurité…",
    "Ce peut être un endroit réel ou imaginaire…",
    "Observe les détails autour de toi : les couleurs, les formes…",
    "Entends les sons apaisants qui t'entourent…",
    "Sentez l’air sur ta peau, la température agréable…",
    "Ressens la sécurité, le calme qui baignent cet endroit…",
    "Inspire profondément cette sensation de protection…",
    "Expire lentement tout ce qui est lourd ou tendu en toi…",
    "Dans ce lieu sûr, tu es libre d'être toi-même…",
    "Ressens ton corps se détendre un peu plus à chaque souffle…",
    "Ton cœur se calme, ton esprit s'apaise…",
    "Reste quelques instants dans ce refuge intérieur…",
    "Sache que tu peux revenir ici dès que tu en ressens le besoin…",
    "Prends une dernière respiration profonde…",
    "Puis, quand tu es prêt(e), ouvre doucement les yeux…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Visualisation d’un lieu sûr</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
