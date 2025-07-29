'use client'

import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function BraceletCustomPage() {
  return (
    <div className="bg-white text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="text-center py-10 px-4 bg-gradient-to-b from-blue-100 to-white">
        <h1 className="text-4xl font-bold mb-4">Bracelet Emotion & Sérénité</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Personnalise ton bijou et fais-en un symbole unique de transformation.
        </p>
        <Link
          href="https://buy.stripe.com/4gMaEY8SM2AceoFcWj5os06"
          target="_blank"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-full font-medium hover:opacity-90"
        >
          Commander maintenant — 39,99€
        </Link>
      </section>

      {/* Gallery Section */}
      <section className="py-10 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {['bracelet.png', 'bracelet2.png', 'bracelet3.png'].map((img, index) => (
            <div key={index} className="rounded overflow-hidden shadow hover:shadow-lg transition">
              <Image
                src={`/${img}`}
                alt={`Bracelet ${index + 1}`}
                width={400}
                height={400}
                className="object-cover w-full"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Caractéristiques</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <ul className="list-disc list-inside text-gray-700">
              <li>Design épuré et symbolique</li>
              <li>Disponible en 3 finitions</li>
              <li>Fermeture ajustable</li>
            </ul>
            <ul className="list-disc list-inside text-gray-700">
              <li>Livré dans un écrin prêt à offrir</li>
              <li>Garantie 30 jours</li>
              <li>Livraison offerte</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-12 px-4 text-center">
        <h3 className="text-xl font-semibold mb-4">Fais de ce bracelet ton nouveau départ</h3>
        <Link
          href="https://buy.stripe.com/4gMaEY8SM2AceoFcWj5os06"
          target="_blank"
          className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:opacity-90"
        >
          Je commande maintenant — 39,99€
        </Link>
      </section>

      <Footer />
    </div>
  )
} 
