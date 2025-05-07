'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Link from 'next/link'

export default function CoachPage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-10 flex flex-col items-center">
        <div className="max-w-xl text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Trouvez l’accompagnement qui vous convient
          </h1>
          <p className="text-gray-600 text-md">
            Choisissez entre une séance ponctuelle ou un suivi hebdomadaire avec un coach professionnel.
          </p>
        </div>

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 border flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold">Séance à la carte</h2>
              <p className="text-gray-600 mt-2">30 € / session</p>
              <ul className="mt-4 space-y-2 text-sm text-left">
                <li>✅ Une séance unique de coaching</li>
                <li>✅ Disponible selon vos besoins</li>
              </ul>
            </div>
            <a
              href="https://buy.stripe.com/14kdQZbsa1yo94Q000"
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 rounded-xl transition"
            >
              Réserver une séance
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-500 flex flex-col justify-between">
            <div>
              <span className="text-sm font-semibold bg-blue-100 text-blue-600 px-3 py-1 rounded-full inline-block mb-2">
                RECOMMANDÉ
              </span>
              <h2 className="text-xl font-bold">Suivi mensuel</h2>
              <p className="text-gray-600">90 € / mois</p>
              <ul className="mt-4 space-y-2 text-sm text-left">
                <li>✅ 1 session de coaching par semaine</li>
                <li>✅ Support par message illimité entre les sessions</li>
                <li>✅ Paiement automatique mensuel</li>
              </ul>
            </div>
            <a
              href="https://buy.stripe.com/8wM009gMu2Csdl6001"
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 rounded-xl transition"
            >
              S’abonner maintenant
            </a>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            ← Retour à l’accueil
          </Link>
        </div>
      </main>

      <footer className="bg-white text-center py-6 text-gray-500 text-sm mt-12">
        <div className="flex flex-col items-center gap-2">
          <p>Zenora © 2025 — Tous droits réservés</p>
          <div className="flex gap-4 text-blue-500">
            <Link href="/mentions-legales" className="hover:underline">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:underline">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
