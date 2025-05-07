'use client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function ConfiancePage() {
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-yellow-700 mb-6 text-center">Programmes Confiance en soi</h1>
        <div className="w-full max-w-2xl space-y-4">
          <Link href="/programmes/affirmations-confiance" className="block bg-white text-center text-lg font-semibold text-yellow-600 py-4 rounded-xl shadow hover:bg-yellow-100 transition">
            Affirmations de puissance
          </Link>
          <Link href="/programmes/posture-victoire" className="block bg-white text-center text-lg font-semibold text-yellow-600 py-4 rounded-xl shadow hover:bg-yellow-100 transition">
            Posture de victoire
          </Link>
          <Link href="/programmes/memoire-succes" className="block bg-white text-center text-lg font-semibold text-yellow-600 py-4 rounded-xl shadow hover:bg-yellow-100 transition">
            Mémoire d'un succès
          </Link>
        </div>
      </main>
    </div>
  )
}
