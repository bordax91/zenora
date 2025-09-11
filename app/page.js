'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Texte */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              Gérez votre activité de coaching <span className="text-blue-600">simplement</span>
            </h1>
            <p className="text-lg text-gray-600">
              Prise de rendez-vous, paiements, page publique personnalisée – tout-en-un.
            </p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link
                href="/register"
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
              >
                🚀 Essai gratuit 7 jours
              </Link>
              <Link
                href="/pricing"
                className="text-blue-600 font-medium underline text-center"
              >
                Voir les tarifs
              </Link>
            </div>
            <div className="text-sm text-gray-500">Sans carte bancaire – sans engagement</div>
          </div>

          {/* Visuel */}
          <div className="flex justify-center">
            <Image
              src="/visueldashboard.jpg"
              alt="Visuel du dashboard Zenora"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Bénéfices principaux */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Pensé pour les indépendants modernes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">📅 Prise de rendez-vous</h3>
              <p className="text-gray-600">Un calendrier intuitif pour gérer vos sessions facilement.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">💳 Paiements intégrés</h3>
              <p className="text-gray-600">Encaissez vos paiements en toute sécurité via Stripe.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">🌐 Page publique personnalisée</h3>
              <p className="text-gray-600">Partagez un lien pro avec vos offres visibles en un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* POUR QUI ? */}
      <section className="bg-blue-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Pour qui ?</h2>
          <p className="text-lg text-gray-700 mb-6">
            Zenora est conçu pour <strong>les coachs, thérapeutes, praticiens bien-être, freelances</strong> qui veulent une solution simple, efficace et professionnelle pour gérer leur activité.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left mt-10">
            <ul className="space-y-3 text-blue-700 font-medium">
              <li>✅ Outil de prospection IA intégré</li>
              <li>✅ Suivi des ventes et rendez-vous</li>
              <li>✅ Page publique personnalisée</li>
              <li>✅ Prise de rendez-vous avec calendrier</li>
            </ul>
            <ul className="space-y-3 text-blue-700 font-medium">
              <li>✅ Paiement sécurisé par Stripe</li>
              <li>✅ Création d’offres coaching sur-mesure</li>
              <li>✅ Historique et notes sur vos clients</li>
              <li>✅ Simple à utiliser, sans compétences techniques</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Visuel page publique */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-10">Votre page personnalisée</h2>
          <Image
            src="/visuelusername.jpg"
            alt="Exemple de page personnalisée de coach"
            width={1000}
            height={600}
            className="rounded-xl shadow-lg mx-auto"
          />
        </div>
      </section>

      {/* Avis utilisateurs */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Ils utilisent déjà Zenora</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow border text-center">
              <Image
                src="/avis1.jpg"
                alt="Avis utilisateur homme"
                width={80}
                height={80}
                className="mx-auto rounded-full mb-4"
              />
              <p className="italic text-gray-600">"Zenora m’a permis de structurer toute mon activité en ligne. Un vrai gain de temps."</p>
              <p className="mt-2 font-semibold text-gray-700">Julien, coach professionnel</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border text-center">
              <Image
                src="/avis2.jpg"
                alt="Avis utilisatrice femme"
                width={80}
                height={80}
                className="mx-auto rounded-full mb-4"
              />
              <p className="italic text-gray-600">"Simple, fluide et très pro. Mes clientes adorent passer par ma page Zenora."</p>
              <p className="mt-2 font-semibold text-gray-700">Sophie, coach bien-être</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border text-center">
              <Image
                src="/avis3.jpg"
                alt="Avis utilisatrice femme"
                width={80}
                height={80}
                className="mx-auto rounded-full mb-4"
              />
              <p className="italic text-gray-600">"Enfin une solution qui combine coaching humain et digital sans friction."</p>
              <p className="mt-2 font-semibold text-gray-700">Emma, praticienne holistique</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-blue-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">FAQ</h2>
          <div className="space-y-6 text-left text-gray-700">
            <div>
              <h3 className="font-semibold mb-1">💡 Est-ce que je dois avoir des compétences techniques ?</h3>
              <p>Non, Zenora est pensé pour être simple et intuitif. Si vous savez utiliser votre boîte mail, vous saurez utiliser Zenora.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">🧠 Peut-on discuter avec un coach IA ?</h3>
              <p>Oui, en plus de la partie gestion, Zenora propose une IA spécialisée en bien-être mental.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">📱 Y a-t-il une application mobile ?</h3>
              <p>Pas encore. La plateforme est optimisée pour tous les écrans (mobile, tablette, ordinateur).</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">💬 Y a-t-il un chat pour contacter Zenora ?</h3>
              <p>Pas de chat pour l’instant, mais vous pouvez nous écrire via la page <Link href="/contact" className="underline text-blue-600">contact</Link>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-center py-6 text-gray-500 text-sm border-t">
        <div className="flex flex-col items-center gap-2">
          <p>Zenora © 2025 — Tous droits réservés</p>
          <div className="flex gap-4 text-blue-500">
            <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <Link href="/politique-confidentialite" className="hover:underline">Politique de confidentialité</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
