'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CoachingPage() {
  return (
    <>
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">Le Coaching Mental, c’est quoi ?</h1>

        <p className="text-gray-700 leading-relaxed mb-4">
          Le coaching mental est un accompagnement bienveillant qui aide à renforcer la confiance en soi,
          à mieux gérer les émotions et à atteindre ses objectifs personnels ou professionnels.
        </p>

        <p className="text-gray-700 leading-relaxed mb-4">
          Chez <strong>Zenora</strong>, vous pouvez choisir entre un coach humain ou notre IA bienveillante.
          L’objectif est de vous soutenir dans votre cheminement avec douceur et efficacité.
        </p>

        <p className="text-gray-700 leading-relaxed mb-8">
          Nos outils sont basés sur des pratiques de psychologie positive, d'écoute active et de développement personnel.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Carte IA */}
          <div className="border rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">🤖 Discuter avec notre IA</h2>
            <p className="text-gray-600 mb-4">
              Disponible 24h/24, notre intelligence artificielle est toujours prête à vous écouter.
            </p>
            <Link
              href="/chat"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Parler avec l’IA
            </Link>
          </div>

          {/* Carte Coach humain */}
          <div className="border rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">🧑‍💼 Être accompagné par un coach</h2>
            <p className="text-gray-600 mb-4">
              Échangez avec un coach certifié pour un accompagnement personnalisé.
            </p>
            <Link
              href="/coach"
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-200"
            >
              Contacter un coach
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
