'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'
import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-blue-50">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
          Vous vous sentez stressé, perdu ou débordé ?<br />Et si on en parlait ?
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Coaching mental 100% confidentiel. Premier échange offert, sans engagement.
        </p>
        <a
          href="https://zenoraapp.com/merci"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Prendre rendez-vous gratuitement
        </a>
      </section>

      {/* Preuves sociales */}
      <section className="py-12 px-6 max-w-5xl mx-auto text-center">
        <p className="text-xl font-semibold">+1 000 personnes ont déjà discuté avec Zenora</p>
        <div className="mt-6 flex justify-center flex-wrap gap-6">
          <div className="bg-gray-100 p-4 rounded shadow w-60">
            <p className="text-sm">"Super accompagnement, j'ai enfin pu m'exprimer."</p>
            <p className="text-xs text-gray-500 mt-2">- Sophie</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow w-60">
            <p className="text-sm">"L'IA m'a aidé à comprendre mon stress en douceur."</p>
            <p className="text-xs text-gray-500 mt-2">- Thomas</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow w-60">
            <p className="text-sm">"Simple, rapide, efficace."</p>
            <p className="text-xs text-gray-500 mt-2">- Camille</p>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Pourquoi choisir Zenora ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>🔄 Reprendre le contrôle de ses émotions</div>
          <div>🧘‍♀️ Apprendre à gérer le stress</div>
          <div>🧠 Mieux dormir, se concentrer, se motiver</div>
          <div>💬 Coaching par message, visio ou téléphone</div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section className="py-16 px-6 bg-blue-50 text-center">
        <h2 className="text-3xl font-bold mb-6">Comment ça fonctionne ?</h2>
        <ol className="space-y-4 max-w-xl mx-auto text-left">
          <li>1. Réservez un créneau</li>
          <li>2. Parlez à notre IA ou à un coach</li>
          <li>3. Recevez un plan personnalisé</li>
        </ol>
      </section>

      {/* CTA secondaire */}
      <section className="text-center py-12 px-6">
        <h3 className="text-2xl font-semibold mb-2">Commencer sans stress – c’est gratuit</h3>
        <p className="text-sm text-gray-600 mb-4">Pas besoin de carte bancaire. Disponible 24h/24.</p>
        <a
          href="https://zenoraapp.com/merci"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Prendre rendez-vous
        </a>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Questions Fréquemment Posées</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Est-ce que c’est confidentiel ?</summary>
            <p className="text-sm mt-2">Oui, toutes les discussions sont 100% confidentielles.</p>
          </details>
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Puis-je annuler mon rendez-vous ?</summary>
            <p className="text-sm mt-2">Oui, vous pouvez annuler ou reprogrammer à tout moment.</p>
          </details>
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Est-ce qu’on parle à un humain ou juste à une IA ?</summary>
            <p className="text-sm mt-2">Vous choisissez : IA empathique ou coach humain.</p>
          </details>
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Combien coûte l’abonnement après ?</summary>
            <p className="text-sm mt-2">Nos offres commencent à 39,99€ / séance ou 129,99€ / mois.</p>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  )
}
