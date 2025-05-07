'use client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function StressPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Programmes Anti-Stress</h1>
        <div className="w-full max-w-2xl space-y-4">
          {/* Lien vers Respiration 4-7-8 */}
          <Link href="/programmes/respiration" className="block bg-white text-center text-lg font-semibold text-blue-600 py-4 rounded-xl shadow hover:bg-blue-100 transition">
            Respiration 4-7-8
          </Link>

          {/* Lien vers Marche consciente */}
          <Link href="/programmes/marche" className="block bg-white text-center text-lg font-semibold text-blue-600 py-4 rounded-xl shadow hover:bg-blue-100 transition">
            Marche consciente
          </Link>

          {/* Lien vers Visualisation de l'apaisement */}
          <Link href="/programmes/visualisation" className="block bg-white text-center text-lg font-semibold text-blue-600 py-4 rounded-xl shadow hover:bg-blue-100 transition">
            Visualisation de l’apaisement
          </Link>
        </div>
      </main>
    </div>
  )
}
