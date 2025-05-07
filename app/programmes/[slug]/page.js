'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import programmesData from '../programmesData'
import Header from '@/components/Header'
import Link from 'next/link'

export default function ProgrammePage() {
  const { slug } = useParams()
  const [currentLine, setCurrentLine] = useState(0)

  const allProgrammes = Object.values(programmesData).flat()
  const programme = allProgrammes.find((p) => p.slug === slug)

  useEffect(() => {
    if (!programme) return
    if (currentLine < programme.lines.length - 1) {
      const timer = setTimeout(() => {
        setCurrentLine((prev) => prev + 1)
      }, 2000) // 2 secondes entre chaque ligne
      return () => clearTimeout(timer)
    }
  }, [currentLine, programme])

  if (!programme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Header />
        <h1 className="text-2xl font-bold">Programme introuvable</h1>
        <Link href="/" className="text-blue-500 hover:underline mt-4">← Retour à l’accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-6">{programme.title}</h1>

          <div className="space-y-4 text-lg text-gray-700">
            {programme.lines.slice(0, currentLine + 1).map((line, index) => (
              <p
                key={index}
                className="opacity-0 animate-fade-in transition-opacity duration-700 ease-out"
                style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
              >
                {line}
              </p>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/chat" className="text-blue-500 hover:underline text-sm">
              ← Retour au chat
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
