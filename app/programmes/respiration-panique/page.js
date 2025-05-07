'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function RespirationPanique() {
  const [lines, setLines] = useState([])
  const text = [
    "Installe-toi dans une position confortable…",
    "Pose une main sur ta poitrine et une main sur ton ventre…",
    "Inspire doucement par le nez pendant 4 secondes…",
    "Suis l’air qui gonfle ton ventre, pas ta poitrine…",
    "Retiens ta respiration pendant 2 secondes…",
    "Puis expire lentement par la bouche pendant 6 secondes…",
    "Imagine que tu souffles doucement sur une bougie sans l’éteindre…",
    "Inspire… 2… 3… 4…",
    "Retiens… 1… 2…",
    "Expire… 1… 2… 3… 4… 5… 6…",
    "Continue ce rythme pendant quelques minutes…",
    "À chaque expiration, imagine expulser la peur hors de ton corps…",
    "Ton cœur ralentit…",
    "Ton corps se détend…",
    "Ton esprit retrouve son calme naturel…",
    "Tu es en sécurité, ici et maintenant…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Respiration anti-panique</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
