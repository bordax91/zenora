import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

export default function BraceletPage() {
  const [selectedImage, setSelectedImage] = useState('/bracelet.png');

  return (
    <div className="bg-white text-gray-800">
      <Header />

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image principale */}
          <div className="flex flex-col items-center">
            <Image
              src={selectedImage}
              alt="Bracelet Spirituel"
              width={500}
              height={500}
              className="rounded shadow-lg object-contain"
            />

            {/* Vignettes */}
            <div className="flex gap-4 mt-4">
              {['/bracelet.png', '/bracelet2.png', '/bracelet3.png'].map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)}>
                  <Image
                    src={img}
                    alt={`Bracelet vue ${i + 1}`}
                    width={100}
                    height={100}
                    className={`rounded border ${selectedImage === img ? 'border-blue-600' : 'border-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Détails produit */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-4">Bracelet Énergie & Sérénité</h1>
            <p className="text-gray-700 mb-4">
              Ce bracelet spirituel favorise l'équilibre intérieur, la sérénité et la confiance en soi.
              Fabriqué avec soin, il accompagne ton quotidien comme un rappel puissant de ta force intérieure.
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li>🌿 Ajustable et unisexe</li>
              <li>🔮 Signification spirituelle forte</li>
              <li>📦 Livraison gratuite</li>
              <li>💳 Paiement sécurisé</li>
            </ul>
            <p className="text-2xl font-bold mb-4">39,99€</p>
            <Link
              href="https://buy.stripe.com/4gMaEY8SM2AceoFcWj5os06"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition"
            >
              Je commande maintenant
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
