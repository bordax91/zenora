'use client'

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

export default function SalesPage() {
  const handleStripeClick = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'ClickBuyStripeZenora');
    }
  };

  return (
    <div className="bg-white text-gray-800">
      {/* Meta Pixel Script */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
          n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '613243461182951'); 
          fbq('track', 'PageView');
        `}
      </Script>

      <Header />

      {/* ACCROCHE EMOTIONNELLE */}
      <section className="bg-white py-6 px-4 text-center border-b">
        <h2 className="text-xl sm:text-2xl font-semibold max-w-2xl mx-auto">
          Tu as l'impression de ne plus te reconnaître après cette rupture ?
        </h2>
        <p className="mt-2 max-w-xl mx-auto text-gray-600">
          Ce programme t’aide à retrouver confiance, estime, et sérénité — à ton rythme, sans pression.
        </p>
      </section>

      {/* CTA FIXE EN HAUT DE PAGE */}
      <section className="bg-blue-50 py-4 px-4 text-center">
        <Link
          href="https://buy.stripe.com/00w3cw6KE0s480hbSf5os05"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStripeClick}
          className="inline-block bg-blue-600 text-white font-semibold text-sm sm:text-base px-6 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          🎉 Je m’inscris maintenant à la formation
        </Link>

        <div className="mt-4 flex justify-center">
          <Image
            src="/imagepagevente.png"
            alt="Aperçu de la formation"
            width={600}
            height={400}
            className="rounded shadow"
          />
        </div>

        <p className="text-sm text-red-600 mt-4">
          📌 Tarif spécial se terminant très bientôt
        </p>
      </section>

      {/* HERO SECTION */}
      <section className="text-center py-12 px-4 bg-blue-50">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Se relever après une rupture
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Une formation bienveillante pour guérir, se reconstruire, et retrouver confiance en soi après une séparation difficile.
        </p>
      </section>

      {/* MODULES */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Ce que tu vas apprendre</h2>

        {[
          ['Module 1 — Comprendre ce que tu ressens', 'Pourquoi tu ressens ce vide, cette tristesse, cette obsession… Et comment mettre des mots sur ce que tu vis pour reprendre le contrôle.'],
          ['Module 2 — Se libérer du passé', 'Tu vas identifier les liens invisibles qui te retiennent à ton ex, et apprendre à les couper sans culpabilité.'],
          ['Module 3 — Gérer les pensées obsessionnelles', 'Des techniques concrètes pour stopper les ruminations et retrouver un esprit plus calme.'],
          ['Module 4 — Retrouver l’estime de soi', 'Reconnecte avec ta valeur personnelle, même après une rupture douloureuse.'],
          ['Module 5 — Repenser l’amour', 'Ce que cette rupture t’enseigne sur toi, tes besoins, et tes limites.'],
          ['Module 6 — Se projeter avec confiance', 'Redessine ton avenir avec clarté et positivité.'],
        ].map(([title, desc], i) => (
          <div key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p>{desc}</p>
          </div>
        ))}

        <div className="text-center my-8">
          <Link
            href="https://buy.stripe.com/00w3cw6KE0s480hbSf5os05"
            target="_blank"
            onClick={handleStripeClick}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            🎧 Je commence la formation maintenant
          </Link>
        </div>
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

        <div className="text-center mt-8">
          <Link
            href="https://buy.stripe.com/00w3cw6KE0s480hbSf5os05"
            target="_blank"
            onClick={handleStripeClick}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Je veux profiter de la formation + bonus
          </Link>
        </div>
      </section>

      {/* CONTENU */}
      <section className="py-12 px-6 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">Tu reçois immédiatement :</h2>
        <ul className="list-disc list-inside max-w-2xl mx-auto text-left text-gray-700 space-y-2">
          <li>✔️ 6 modules audio (écoute sur mobile possible)</li>
          <li>✔️ 6 PDF d’accompagnement (à imprimer ou annoter)</li>
          <li>✔️ 2 bonus pratiques pour t’aider au quotidien</li>
          <li>✔️ Accès à vie, en illimité</li>
          <li>✔️ Paiement sécurisé via Stripe</li>
        </ul>
      </section>

      {/* TARIF FINAL */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Tarif</h2>
        <p className="text-xl mb-2">97€ TTC</p>
        <p className="text-sm text-gray-600 mb-6">Paiement sécurisé · Accès immédiat · À vie</p>
        <Link
          href="https://buy.stripe.com/00w3cw6KE0s480hbSf5os05"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStripeClick}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Je m’inscris maintenant
        </Link>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-12 px-6 bg-blue-50 text-center">
        <h2 className="text-2xl font-bold mb-6">Elles en parlent mieux que nous</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-4xl mx-auto">
          {[
            '“Je me suis sentie comprise pour la première fois depuis des semaines.” – Élodie',
            '“Les exercices sont simples mais puissants. J’ai pleuré, mais j’ai aussi beaucoup guéri.” – Sarah',
            '“J’avais déjà testé plein de trucs. Là j’ai eu une vraie transformation.” – Inès',
          ].map((t, i) => (
            <blockquote key={i} className="bg-white border rounded shadow p-4 text-sm">
              {t}
            </blockquote>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="https://buy.stripe.com/00w3cw6KE0s480hbSf5os05"
            target="_blank"
            onClick={handleStripeClick}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Je veux vivre cette transformation moi aussi
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6 text-center">FAQ — Tu te poses peut-être encore ces questions</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <div>
            <h3 className="font-semibold">🕒 Est-ce que je peux suivre la formation à mon rythme ?</h3>
            <p>Oui, tu peux écouter les audios quand tu veux. Il n’y a pas de date limite.</p>
          </div>
          <div>
            <h3 className="font-semibold">📱 Est-ce que je peux écouter sur mobile ?</h3>
            <p>Oui, tout fonctionne sur téléphone. Tu peux même télécharger les audios.</p>
          </div>
          <div>
            <h3 className="font-semibold">💳 Est-ce que le paiement est sécurisé ?</h3>
            <p>Oui, il passe par Stripe (le leader mondial du paiement en ligne).</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
