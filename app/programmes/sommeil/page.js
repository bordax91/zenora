'use client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function SommeilPage() {
  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Programmes Sommeil</h1>
        <div className="w-full max-w-2xl space-y-4">
          <Link href="/programmes/routine" className="block bg-white text-center text-lg font-semibold text-indigo-600 py-4 rounded-xl shadow hover:bg-indigo-100 transition">
            Routine de déconnexion
          </Link>
          <Link href="/programmes/voyage" className="block bg-white text-center text-lg font-semibold text-indigo-600 py-4 rounded-xl shadow hover:bg-indigo-100 transition">
            Voyage imaginaire
          </Link>
          <Link href="/programmes/respiration-sommeil" className="block bg-white text-center text-lg font-semibold text-indigo-600 py-4 rounded-xl shadow hover:bg-indigo-100 transition">
            Respiration pour s’endormir
          </Link>
        </div>
      </main>
    </div>
  )
}
