'use client'
import Link from 'next/link'

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Politique de Confidentialité</h1>
        <p>Zenora respecte votre vie privée. Vos données personnelles ne sont utilisées que pour améliorer votre expérience utilisateur et vous fournir nos services.</p>
        <p>Nous ne partageons jamais vos informations sans votre consentement.</p>
        <p>Pour toute demande relative à vos données : contact@zenoraapp.com</p>

        <Link href="/" className="text-blue-500 hover:underline">← Retour à l’accueil</Link>
      </div>
    </div>
  )
}
