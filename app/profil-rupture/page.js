'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetch('/api/send-leadmagnet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    setSent(true)
  }

  return (
    <div className="bg-white text-gray-800">
      <Header />

      {/* Hero Section ajustée pour tenir dans l'écran */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-blue-50">
        <h1 className="text-3xl sm:text-4xl font-bold leading-snug mb-2 max-w-xl">
          Et si cette rupture était le début d’un renouveau ?
        </h1>

        <p className="text-base sm:text-lg text-gray-700 mb-4 max-w-lg">
          Télécharge gratuitement notre guide pour découvrir ton profil émotionnel après une rupture et commencer un vrai chemin de reconstruction.
        </p>

        {/* IMAGE DU GUIDE */}
        <div className="mb-4">
          <Image
            src="/imagepostrupture.png"
            alt="Guide profil après rupture"
            width={180}
            height={240}
            className="rounded shadow-sm"
          />
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          {sent ? (
            <p className="text-green-600">Merci ! Ton guide a été envoyé par e-mail.</p>
          ) : (
            <>
              <input
                type="email"
                required
                placeholder="Ton adresse e-mail"
                className="w-full border px-4 py-2 rounded mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Recevoir le guide gratuit
              </button>
            </>
          )}
        </form>
      </section>

      {/* Message personnel */}
      <section className="py-12 px-6 max-w-3xl mx-auto text-center">
        <p className="text-lg text-gray-700 italic">
          "Je sais à quel point une rupture peut laisser un vide immense. Chez Zenora, on ne te propose pas juste du réconfort. On t’accompagne vers une version plus forte de toi-même."
        </p>
        <p className="mt-4 font-semibold">- L’équipe Zenora</p>
      </section>

      {/* Douleurs vécues */}
      <section className="py-12 px-6 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Tu ressens peut-être...</h2>
        <ul className="max-w-2xl mx-auto space-y-2 text-gray-700">
          <li>- Une perte de sens ou d’envie</li>
          <li>- Une peur de ne plus jamais aimer</li>
          <li>- Des pensées récurrentes qui t’épuisent</li>
          <li>- Un sentiment de solitude ou d’incompréhension</li>
        </ul>
      </section>

      {/* Preuves sociales */}
      <section className="py-12 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Elles ont déjà transformé leur douleur en force</h2>
        <div className="mt-6 flex justify-center flex-wrap gap-6">
          <div className="bg-white border p-4 rounded shadow w-60">
            <p className="text-sm">"Je croyais que c’était la fin. En fait, c’était le début de moi-même."</p>
            <p className="text-xs text-gray-500 mt-2">- Clara</p>
          </div>
          <div className="bg-white border p-4 rounded shadow w-60">
            <p className="text-sm">"Le guide m’a mis une claque douce. Je me suis reconnue à chaque page."</p>
            <p className="text-xs text-gray-500 mt-2">- Léa</p>
          </div>
          <div className="bg-white border p-4 rounded shadow w-60">
            <p className="text-sm">"Ce que j’ai compris grâce à Zenora m’a changée durablement."</p>
            <p className="text-xs text-gray-500 mt-2">- Mélanie</p>
          </div>
        </div>
      </section>

      {/* Pourquoi c’est différent */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6">Pourquoi Zenora n’est pas une méthode de plus</h2>
        <p className="max-w-3xl mx-auto text-gray-700">
          Zenora n’essaie pas de te dire quoi penser. On t’écoute. On t’accompagne. On te propose des outils adaptés à ton profil émotionnel, et un coaching bienveillant pour avancer à ton rythme.
        </p>
      </section>

      {/* CTA final */}
      <section className="text-center py-12 px-6 bg-blue-50">
        <h3 className="text-2xl font-semibold mb-2">Reçois ton guide gratuit maintenant</h3>
        <p className="text-sm text-gray-600 mb-4">Sans engagement – 100% confidentiel</p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          {sent ? (
            <p className="text-green-600">Merci ! Ton guide a été envoyé par e-mail.</p>
          ) : (
            <>
              <input
                type="email"
                required
                placeholder="Ton adresse e-mail"
                className="w-full border px-4 py-3 rounded mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
              >
                Obtenir le guide maintenant
              </button>
            </>
          )}
        </form>
      </section>

      <Footer />
    </div>
  )
}
