import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BraceletPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white text-center px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Bracelet Émotion & Sérénité</h1>
        <p className="text-gray-700 mb-6">Personnalise ton bijou et fais-en un symbole unique de transformation.</p>

        <a
          href="https://buy.stripe.com/4gMaEY8SM2AceoFcWj5os06"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          Commander maintenant — 39,99€
        </a>

        {/* Logo Stripe */}
        <div className="mt-4 flex justify-center">
          <Image
            src="/logostripe.png" // remplace par /15289B9A-F1F1-41B5-9D0D-BF113F0195E0.jpeg si tu l’as renommé
            alt="Paiement sécurisé Stripe"
            width={180}
            height={60}
            className="object-contain"
          />
        </div>

        {/* Images bracelet */}
        <div className="flex justify-center gap-4 mt-10 flex-wrap">
          <Image src="/bracelet.png" alt="Bracelet 1" width={200} height={200} />
          <Image src="/bracelet2.png" alt="Bracelet 2" width={200} height={200} />
          <Image src="/bracelet3.png" alt="Bracelet 3" width={200} height={200} />
        </div>

        {/* Caractéristiques */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto text-gray-700">
            <li>✅ Design épuré et symbolique</li>
            <li>✅ Disponible en 3 finitions</li>
            <li>✅ Fermeture ajustable</li>
            <li>✅ Livré dans un écrin prêt à offrir</li>
            <li>✅ Garantie 30 jours</li>
            <li>✅ Livraison offerte</li>
          </ul>
        </section>

        <p className="mt-12 font-medium text-lg">Fais de ce bracelet ton nouveau départ 🌱</p>
      </main>

      <Footer />
    </div>
  );
}
