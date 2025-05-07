'use client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function RelationsPage() {
  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <Header />
      <main className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-pink-700 mb-6">Programmes Relations</h1>
        <div className="w-full max-w-2xl space-y-4">
          <Link href="/programmes/cercle" className="block bg-white text-center text-lg font-semibold text-pink-600 py-4 rounded-xl shadow hover:bg-pink-100 transition">
            Cercle de bienveillance
          </Link>
          <Link href="/programmes/ecoute" className="block bg-white text-center text-lg font-semibold text-pink-600 py-4 rounded-xl shadow hover:bg-pink-100 transition">
            Écoute active intérieure
          </Link>
          <Link href="/programmes/lacher-prise" className="block bg-white text-center text-lg font-semibold text-pink-600 py-4 rounded-xl shadow hover:bg-pink-100 transition">
            Lâcher-prise sur les tensions
          </Link>
        </div>
      </main>
    </div>
  )
}
