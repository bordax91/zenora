'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function FormationAccessPage() {
  return (
    <div className="bg-white text-gray-800 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 bg-blue-50 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Accès à ta formation Zenora
        </h1>

        <p className="text-lg text-gray-700 max-w-xl mb-6">
          Bravo pour ton engagement 💙<br />
          Tu peux accéder à l’intégralité des modules et bonus via le lien ci-dessous.
        </p>

        <a
          href="https://drive.google.com/drive/folders/168uieoOChExpCEz6vawAzCikV_ona9kp?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded shadow transition"
        >
          📂 Accéder à la formation
        </a>

        <p className="text-sm text-gray-500 mt-6 max-w-sm">
          N’oublie pas d’enregistrer ce lien pour pouvoir y revenir à tout moment.
        </p>
      </main>

      <Footer />
    </div>
  )
}
