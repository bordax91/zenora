'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Texte et boutons */}
          <div className="space-y-6 text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Le seul espace bienveillant pour exprimer vos 
              <span className="text-blue-500"> émotions</span> et 
              <span className="text-blue-500"> prendre soin de votre santé mental</span>.
            </h1>
            <p className="text-gray-600 text-lg">
              Choisissez entre notre intelligence artificielle ou un accompagnement humain.
            </p>

            {/* Boutons alignés à gauche */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-start gap-4">
              <Link
                href="/chat"
                className="bg-blue-600 text-white text-center font-semibold py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition w-full sm:w-auto"
              >
                🧠 Discuter gratuitement avec notre IA spécialisée
              </Link>
              <Link
                href="/coach"
                className="bg-white text-blue-700 text-center font-semibold py-3 px-6 rounded-lg shadow border hover:bg-blue-50 transition w-full sm:w-auto"
              >
                👤 Discuter avec un coach mental
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <span>4.8/5 sur nos utilisateurs</span>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/therapist.png"
                alt="Illustration discussion"
                width={400}
                height={400}
                className="w-full h-auto object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Section Nos Thèmes */}
        <section id="themes" className="mt-20 w-full">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-10">Nos Thèmes</h2>

          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
            <Link href="/programmes/stress" className="bg-blue-100 hover:bg-blue-200 transition p-6 rounded-2xl shadow-md flex items-center">
              <span className="text-4xl mr-4">😌</span>
              <span className="text-xl font-semibold text-gray-800">Stress</span>
            </Link>
            <Link href="/programmes/sommeil" className="bg-purple-100 hover:bg-purple-200 transition p-6 rounded-2xl shadow-md flex items-center">
              <span className="text-4xl mr-4">😴</span>
              <span className="text-xl font-semibold text-gray-800">Sommeil</span>
            </Link>
            <Link href="/programmes/confiance" className="bg-yellow-100 hover:bg-yellow-200 transition p-6 rounded-2xl shadow-md flex items-center">
              <span className="text-4xl mr-4">🌟</span>
              <span className="text-xl font-semibold text-gray-800">Confiance en soi</span>
            </Link>
            <Link href="/programmes/relaxation" className="bg-green-100 hover:bg-green-200 transition p-6 rounded-2xl shadow-md flex items-center">
              <span className="text-4xl mr-4">🧘‍♂️</span>
              <span className="text-xl font-semibold text-gray-800">Relaxation</span>
            </Link>
            <Link href="/programmes/relations" className="bg-pink-100 hover:bg-pink-200 transition p-6 rounded-2xl shadow-md flex items-center">
              <span className="text-4xl mr-4">❤️</span>
              <span className="text-xl font-semibold text-gray-800">Relations</span>
            </Link>
            <Link href="/programmes/anxiete" className="bg-red-100 hover:bg-red-200 transition p-6 rounded-2xl shadow-md flex items-center">
              <span className="text-4xl mr-4">😰</span>
              <span className="text-xl font-semibold text-gray-800">Anxiété</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white text-center py-6 text-gray-500 text-sm mt-12">
        <div className="flex flex-col items-center gap-2">
          <p>Zenora © 2025 — Tous droits réservés</p>
          <div className="flex gap-4 text-blue-500">
            <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <Link href="/politique-confidentialite" className="hover:underline">Politique de confidentialité</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
