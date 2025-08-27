'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AbonnementPage() {
  const router = useRouter()

  const monthlyLink = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_LINK
  const yearlyLink = process.env.NEXT_PUBLIC_STRIPE_YEARLY_LINK

  useEffect(() => {
    document.title = 'Abonnement - Zenora'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Zenora Logo" width={50} height={50} />
          <h1 className="text-2xl font-bold mt-4 text-gray-800">Votre essai est terminé</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Pour continuer à utiliser Zenora, veuillez souscrire à un abonnement.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <a
            href={monthlyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition"
          >
            🔁 Abonnement Mensuel – 39€/mois
          </a>

          <a
            href={yearlyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold transition"
          >
            🔒 Abonnement Annuel – 349€/an
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Vous pourrez annuler à tout moment depuis votre compte Stripe.
        </p>
      </div>
    </div>
  )
}
