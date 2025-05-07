'use client'
import Header from '@/components/Header'
import { useEffect, useState } from 'react'

export default function CercleBienveillance() {
  const [lines, setLines] = useState([])
  const text = [
    "Ferme doucement les yeux…",
    "Prends une profonde inspiration…",
    "Expire lentement toute tension…",
    "Visualise autour de toi cinq personnes qui comptent beaucoup…",
    "Elles se tiennent là, souriantes, bienveillantes…",
    "Imagine une lumière dorée qui part de ton cœur…",
    "Cette lumière douce les enveloppe, une par une…",
    "Envoie-leur mentalement des vœux de bonheur et de paix…",
    "« Je te souhaite du bonheur. »",
    "« Je te souhaite de la sérénité. »",
    "« Je te souhaite la joie. »",
    "Ressens la chaleur de cette bienveillance grandir dans ton cœur…",
    "Plus tu donnes d’amour, plus tu en reçois…",
    "Respire dans cette énergie d’amour universel…",
    "Souris intérieurement, doucement…"
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Cercle de bienveillance</h1>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {lines.map((line, index) => (
            <p key={index} className="animate-fade-in text-gray-800 text-lg">{line}</p>
          ))}
        </div>
      </main>
    </div>
  )
}
