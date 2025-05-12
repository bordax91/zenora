'use client'
import Link from 'next/link'

export default function Contact() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Contact</h1>
        <p>Vous souhaitez nous contacter ?</p>
        <p>Envoyez-nous un email à : <a href="mailto:contact@zenoraapp.com" className="text-blue-600 hover:underline">contact@zenoraapp.com</a></p>
        <p>Nous vous répondrons sous 24 heures.</p>

        <Link href="/" className="text-blue-500 hover:underline">← Retour à l’accueil</Link>
      </div>
    </div>
  )
}
