'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
          <span className="font-bold text-lg">Zenora Coach</span>
          <div className="flex gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  pathname === link.href
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                } pb-1`}
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
