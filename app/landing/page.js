'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <main className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Vous vous sentez stressé, perdu ou débordé ?<br />Et si on en parlait ?</h1>
        <p className="text-lg md:text-xl mb-6">Coaching mental 100% confidentiel. Premier échange offert, sans engagement.</p>
        <a href="https://zenoraapp.com/merci" target="_blank" rel="noopener noreferrer">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition">Prendre rendez-vous gratuitement</button>
        </a>
      </section>

      {/* Preuves sociales */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">Ils nous font confiance</h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <div className="bg-gray-50 p-4 rounded-xl shadow w-full md:w-1/4">
            <p>“Un vrai soulagement, j’ai pu vider mon sac sans jugement.”</p>
            <span className="block mt-2 text-sm text-gray-500">— Clara</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl shadow w-full md:w-1/4">
            <p>“J’avais besoin d’aide rapidement, Zenora était là.”</p>
            <span className="block mt-2 text-sm text-gray-500">— Léo</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl shadow w-full md:w-1/4">
            <p>“Une approche moderne et bienveillante, je recommande !”</p>
            <span className="block mt-2 text-sm text-gray-500">— Amélie</span>
          </div>
        </div>
        <div className="mt-8 text-gray-600">+1 000 personnes ont déjà discuté avec Zenora</div>
      </section>

      {/* Bénéfices */}
      <section className="py-16 px-6 bg-blue-50 text-center">
        <h2 className="text-2xl font-bold mb-8">Pourquoi choisir Zenora ?</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>🔄 Reprendre le contrôle de ses émotions</div>
          <div>🧘‍♀️ Apprendre à gérer le stress</div>
          <div>🧠 Mieux dormir, se concentrer, se motiver</div>
          <div>💬 Coaching par message, visio ou téléphone</div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">Comment ça marche ?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <div className="text-4xl mb-2">1️⃣</div>
            <p>Réservez un créneau</p>
          </div>
          <div>
            <div className="text-4xl mb-2">2️⃣</div>
            <p>Parlez à notre IA ou à un coach</p>
          </div>
          <div>
            <div className="text-4xl mb-2">3️⃣</div>
            <p>Recevez un plan personnalisé</p>
          </div>
        </div>
      </section>

      {/* CTA secondaire */}
      <section className="py-12 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Commencer sans stress – c’est gratuit</h2>
        <p className="mb-4">Pas besoin de carte bancaire. Disponible 24h/24.</p>
        <a href="https://zenoraapp.com/merci" target="_blank" rel="noopener noreferrer">
          <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition">Prendre rendez-vous gratuitement</button>
        </a>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Questions fréquentes</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">Est-ce que c’est confidentiel ?</h3>
            <p className="text-gray-600">Oui. Vos échanges restent strictement privés et ne sont jamais partagés.</p>
          </div>
          <div>
            <h3 className="font-semibold">Est-ce que je peux annuler ?</h3>
            <p className="text-gray-600">Bien sûr. Vous pouvez annuler ou reporter une session à tout moment.</p>
          </div>
          <div>
            <h3 className="font-semibold">Est-ce que je peux parler à un humain ou juste une IA ?</h3>
            <p className="text-gray-600">Vous avez le choix. Notre IA est toujours disponible, et vous pouvez aussi réserver un coach humain.</p>
          </div>
          <div>
            <h3 className="font-semibold">Combien coûte l’abonnement après ?</h3>
            <p className="text-gray-600">À partir de 129,99€/mois. Sans engagement, résiliable à tout moment.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
