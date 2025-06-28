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
          Offre découverte : un appel gratuit<br />avec un expert à l’écoute
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Coaching post-rupture 100% confidentiel. Aucun engagement requis.
        </p>
        <a
          href="https://zenoraapp.com/merci"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Réserver mon appel gratuit
        </a>
      </section>

      {/* Preuves sociales */}
      <section className="py-12 px-6 max-w-5xl mx-auto text-center">
        <p className="text-xl font-semibold">+1 000 personnes ont déjà trouvé un soulagement avec Zenora</p>
        <div className="mt-6 flex justify-center flex-wrap gap-6">
          <div className="bg-gray-100 p-4 rounded shadow w-60">
            <p className="text-sm">"L’appel m’a fait un bien fou. J’ai enfin pu vider mon sac."</p>
            <p className="text-xs text-gray-500 mt-2">- Marie</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow w-60">
            <p className="text-sm">"J’ai reçu de vrais conseils, sans jugement."</p>
            <p className="text-xs text-gray-500 mt-2">- Hugo</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow w-60">
            <p className="text-sm">"Juste un appel et je me suis sentie moins seule."</p>
            <p className="text-xs text-gray-500 mt-2">- Laura</p>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Pourquoi réserver l’appel découverte ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>❤️ Être écouté(e) sans jugement</div>
          <div>🧭 Faire le point sur ses émotions</div>
          <div>💬 Recevoir un plan d’accompagnement personnalisé</div>
          <div>📞 Coaching possible par téléphone, visio ou message</div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section className="py-16 px-6 bg-blue-50 text-center">
        <h2 className="text-3xl font-bold mb-6">Comment ça marche ?</h2>
        <ol className="space-y-4 max-w-xl mx-auto text-left">
          <li>1. Cliquez sur "Réserver mon appel gratuit"</li>
          <li>2. Choisissez un créneau sur notre agenda</li>
          <li>3. Discutez librement avec un expert Zenora</li>
        </ol>
      </section>

      {/* CTA secondaire */}
      <section className="text-center py-12 px-6">
        <h3 className="text-2xl font-semibold mb-2">L’appel est offert – Profitez-en</h3>
        <p className="text-sm text-gray-600 mb-4">Sans carte bancaire. Disponible 24h/24.</p>
        <a
          href="https://zenoraapp.com/merci"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Réserver mon appel maintenant
        </a>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Questions fréquentes</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Est-ce que c’est confidentiel ?</summary>
            <p className="text-sm mt-2">Oui, toutes les discussions sont confidentielles et sécurisées.</p>
          </details>
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Puis-je annuler ou reporter l’appel ?</summary>
            <p className="text-sm mt-2">Oui, depuis le lien Calendly reçu après réservation.</p>
          </details>
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Dois-je parler à une IA ?</summary>
            <p className="text-sm mt-2">Non, l’appel découverte est avec un humain.</p>
          </details>
          <details className="border rounded p-4">
            <summary className="font-semibold cursor-pointer">Combien coûte la suite ?</summary>
            <p className="text-sm mt-2">L’abonnement complet est à 129,99€/mois – sans engagement.</p>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  )
}
