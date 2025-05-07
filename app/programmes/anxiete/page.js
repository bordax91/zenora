'use client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function AnxietePage() {
  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">Programmes Anxiété</h1>
        <div className="w-full max-w-2xl space-y-4">
          <Link href="/programmes/ancrage-present" className="block bg-white text-center text-lg font-semibold text-purple-600 py-4 rounded-xl shadow hover:bg-purple-100 transition">
            Ancrage corporel
          </Link>
          <Link href="/programmes/respiration-panique" className="block bg-white text-center text-lg font-semibold text-purple-600 py-4 rounded-xl shadow hover:bg-purple-100 transition">
            Respiration contre la panique
          </Link>
          <Link href="/programmes/lieu-sur" className="block bg-white text-center text-lg font-semibold text-purple-600 py-4 rounded-xl shadow hover:bg-purple-100 transition">
            Créer un lieu sûr
          </Link>
        </div>
      </main>
    </div>
  )
}
