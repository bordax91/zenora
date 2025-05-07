'use client'
import Link from 'next/link'

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Mentions Légales</h1>
        <p>Éditeur du site : Zenora</p>
        <p>Responsable de la publication : Axell Bordelais</p>
        <p>Email : contact@zenora.com</p>
        <p>Hébergeur : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>

        <Link href="/" className="text-blue-500 hover:underline">← Retour à l’accueil</Link>
      </div>
    </div>
  )
}
