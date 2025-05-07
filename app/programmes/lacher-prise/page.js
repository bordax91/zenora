'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function LacherPrise() {
  const [lines, setLines] = useState([])
  const text = [
    "Installe-toi confortablement…",
    "Ferme doucement les yeux…",
    "Prends une grande inspiration…",
    "Imagine un fil tendu entre ton cœur et une situation conflictuelle…",
    "Observe ce lien sans jugement…",
    "Maintenant, visualise des ciseaux de lumière dans ta main…",
    "Avec douceur, coupe ce fil…",
    "Sens immédiatement une légèreté naître dans ton cœur…",
    "Tu laisses aller ce qui ne t’appartient plus…",
    "Inspire profondément, remplis-toi de paix…",
    "Expire lentement, libère toute tension restante…",
    "Tu es libre d’avancer sans rancune…",
    "Tu choisis la paix intérieure, encore et encore…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Lâcher-prise sur les tensions</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
