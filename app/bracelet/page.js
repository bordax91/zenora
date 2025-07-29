'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function BraceletPage() {
  // Fonction pour déclencher l'événement Meta Pixel
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'PurchaseBraceletZenora')
    }
  }

  return (
    <div className="bg-white text-gray-800">
      <Header />

      {/* HERO */}
      <section className="py-12 px-6 text-center bg-blue-50">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">Bracelet Émotion & Sérénité</h1>
        <p className="text-lg max-w-xl mx-auto text-gray-700">
          Un symbole puissant pour tourner la page, se reconnecter à soi-même et avancer avec confiance 💙
        </p>
        <Link
          href="https://buy.stripe.com/4gMaEY8SM2AceoFcWj5os06"
          target="_blank"
          onClick={handleClick}
          className="inline-block mt-6 bg-pink-600 text-white px-6 py-3 rounded hover:bg-pink-700 transition"
        >
          Commander pour 39,99€
        </Link>
      </section>

      {/* IMAGES DU PRODUIT */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-6">Choisis ton modèle préféré</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {['bracelet.png', 'bracelet2.png', 'bracelet3.png'].map((src, i) => (
            <div key={i} className="w-64 border rounded shadow p-2">
              <Image
                src={`/${src}`}
                alt={`Bracelet modèle ${i + 1}`}
                width={300}
                height={300}
                className="rounded"
              />
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICES */}
      <section className="py-12 px-6 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-6">Pourquoi ce bracelet ?</h2>
        <ul className="max-w-2xl mx-auto space-y-3 text-gray-700 text-left list-disc list-inside">
          <li>Un symbole concret de renaissance après une rupture</li>
          <li>Un design élégant et discret qui va avec tout</li>
          <li>Chaque bracelet est livré dans un pochon doux prêt à offrir</li>
          <li>Frais de livraison inclus</li>
          <li>Quantité très limitée</li>
        </ul>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Prête à passer à l’étape suivante ?</h2>
        <p className="text-gray-700 mb-4">Offre-toi (ou à une amie) ce symbole de renouveau 💫</p>
        <Link
          href="https://buy.stripe.com/4gMaEY8SM2AceoFcWj5os06"
          target="_blank"
          onClick={handleClick}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Je commande maintenant
        </Link>
      </section>

      <Footer />
    </div>
  )
}
