import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function BraceletPage() {
  return (
    <div className="bg-white text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Image principale du bracelet */}
        <div className="w-full">
          <Image
            src="/bracelet.png"
            alt="Bracelet Emotion & Sérénité"
            width={600}
            height={600}
            className="rounded shadow w-full object-cover"
          />
        </div>

        {/* Infos produit */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Bracelet Emotion & Sérénité</h1>
          <p className="text-gray-700">
            Un bijou simple, symbolique et apaisant — idéal pour marquer un nouveau départ après une période difficile.
          </p>

          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Design épuré et symbolique</li>
            <li>Disponible en 3 finitions (visuellement)</li>
            <li>Fermeture ajustable</li>
            <li>Livré dans un écrin prêt à offrir</li>
            <li>Garantie 30 jours</li>
            <li>Livraison offerte</li>
          </ul>

          <p className="text-xl font-semibold">39,99€</p>

          <Link
            href="https://buy.stripe.com/4gMaEY8SM2AceoFcWj5os06"
            target="_blank"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
          >
            Commander maintenant
          </Link>
        </div>
      </main>

      {/* Galerie secondaire */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Image src="/bracelet.png" alt="Vue 1" width={400} height={400} className="rounded shadow object-cover w-full" />
          <Image src="/bracelet2.png" alt="Vue 2" width={400} height={400} className="rounded shadow object-cover w-full" />
          <Image src="/bracelet3.png" alt="Vue 3" width={400} height={400} className="rounded shadow object-cover w-full" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
