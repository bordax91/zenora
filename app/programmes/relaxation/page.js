'use client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function RelaxationPage() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Programmes Relaxation</h1>
        <div className="w-full max-w-2xl space-y-4">
          <Link href="/programmes/balayage-corporel" className="block bg-white text-center text-lg font-semibold text-green-600 py-4 rounded-xl shadow hover:bg-green-100 transition">
            Balayage corporel
          </Link>
          <Link href="/programmes/meditation-souffle" className="block bg-white text-center text-lg font-semibold text-green-600 py-4 rounded-xl shadow hover:bg-green-100 transition">
            Méditation du souffle
          </Link>
          <Link href="/programmes/gratitude" className="block bg-white text-center text-lg font-semibold text-green-600 py-4 rounded-xl shadow hover:bg-green-100 transition">
            Moment de gratitude
          </Link>
        </div>
      </main>
    </div>
  )
}
