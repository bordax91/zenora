'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function VoyageImaginaire() {
  const [lines, setLines] = useState([])
  const text = [
    "Ferme les yeux doucement…",
    "Imagine-toi marcher pieds nus sur une plage de sable chaud…",
    "Le bruit doux des vagues accompagne ton souffle…",
    "Chaque pas dans le sable te détend un peu plus…",
    "La brise marine caresse ton visage…",
    "Inspire l’air frais et salé, expire toute tension…",
    "Devant toi, un hamac t’attend entre deux palmiers…",
    "Tu t’y installes, bercé doucement par le vent…",
    "Ton corps est léger, ton esprit flotte…",
    "Tu es complètement en sécurité…",
    "Chaque vague au loin t’apaise un peu plus…",
    "Respire doucement, détends-toi complètement…",
    "Ce lieu reste en toi, disponible à tout moment…",
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Voyage Imaginaire</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
