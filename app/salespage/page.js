import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function SalesPage() {
  return (
    <div className="bg-white text-gray-800">
      <Header />

      {/* HERO SECTION AVEC IMAGE */}
      <section className="text-center py-16 px-4 bg-blue-50">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Se relever après une rupture
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Une formation bienveillante pour guérir, se reconstruire, et retrouver confiance en soi après une séparation difficile.
        </p>
        <div className="flex justify-center">
          <Image
            src="/imagepagevente.png"
            alt="Affiche formation Zenora"
            width={320}
            height={480}
            className="rounded shadow-md"
          />
        </div>
      </section>

      {/* MODULES */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Ce que tu vas apprendre</h2>

        {[
          {
            title: 'Module 1 — Comprendre ce que tu ressens',
            text: 'Pourquoi tu ressens ce vide, cette tristesse, cette obsession… Et comment mettre des mots sur ce que tu vis pour reprendre le contrôle.'
          },
          {
            title: 'Module 2 — Se libérer du passé',
            text: 'Tu vas identifier les liens invisibles qui te retiennent à ton ex, et apprendre à les couper sans culpabilité.'
          },
          {
            title: 'Module 3 — Gérer les pensées obsessionnelles',
            text: 'Des techniques concrètes pour stopper les ruminations et retrouver un esprit plus calme.'
          },
          {
            title: 'Module 4 — Retrouver l’estime de soi',
            text: 'Reconnecte avec ta valeur personnelle, même après une rupture douloureuse.'
          },
          {
            title: 'Module 5 — Repenser l’amour',
            text: 'Ce que cette rupture t’enseigne sur toi, tes besoins, et tes limites.'
          },
          {
            title: 'Module 6 — Se projeter avec confiance',
            text: 'Redessine ton avenir avec clarté et positivité.'
          }
        ].map((mod, i) => (
          <div key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{mod.title}</h3>
            <p>{mod.text}</p>
          </div>
        ))}
      </section>

      {/* BONUS */}
      <section className="py-12 px-6 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">2 bonus offerts</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <h4 className="text-lg font-semibold">✅ Check-list : 30 choses à faire après une rupture</h4>
            <p>Des idées concrètes pour avancer, un jour après l’autre.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold">📝 Carnet “21 jours pour moi”</h4>
            <p>Un exercice par jour pour te remettre au centre de ta vie.</p>
          </div>
        </div>
      </section>

      {/* TARIF + CTA */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Tarif</h2>
        <p className="text-xl mb-2">149€ TTC</p>
        <p className="text-sm text-gray-600 mb-6">Paiement sécurisé · Accès immédiat · À vie</p>
        <Link
          href="https://buy.stripe.com/00w3cw6KE0s480hbSf5os05"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Je m’inscris maintenant
        </Link>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-12 px-6 bg-blue-50 text-center">
        <h2 className="text-2xl font-bold mb-6">Elles en parlent mieux que nous</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-4xl mx-auto">
          {[
            '“Je me suis sentie comprise pour la première fois depuis des semaines.” – Élodie',
            '“Les exercices sont simples mais puissants. J’ai pleuré, mais j’ai aussi beaucoup guéri.” – Sarah',
            '“J’avais déjà testé plein de trucs. Là j’ai eu une vraie transformation.” – Inès'
          ].map((t, i) => (
            <blockquote key={i} className="bg-white border rounded shadow p-4 text-sm">
              {t}
            </blockquote>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
