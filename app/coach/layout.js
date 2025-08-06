'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function CoachLayout({ children }) {
  const pathname = usePathname()

  const links = [
    { href: '/coach/dashboard', label: 'Rendez-vous' },
    { href: '/coach/availability', label: 'Disponibilités' },
    { href: '/coach/clients', label: 'Clients' },
    { href: '/coach/packages', label: 'Offres / Forfaits' },
    { href: '/coach/sales', label: 'Ventes' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-14">
          {/* Logo cliquable */}
          <Link href="/coach/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Zenora Logo"
              width={36}
              height={36}
              className="rounded"
            />
            <span className="font-bold text-lg text-gray-800">Zenora Coach</span>
          </Link>

          {/* Liens navigation */}
          <div className="flex gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 transition ${
                  pathname === link.href
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenu de la page */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
