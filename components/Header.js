'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setUserEmail(data.session?.user?.email || null)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setUserEmail(session?.user?.email || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUserEmail(null)
    router.push('/login')
  }

  return (
    <header className="w-full px-6 py-4 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
          <span className="text-lg font-semibold text-gray-800">Zenora</span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex gap-6 ml-8">
          <Link href="/#themes" className="text-gray-600 hover:text-blue-600 font-medium">Nos Thèmes</Link>
          <Link href="/coach" className="text-gray-600 hover:text-blue-600 font-medium">Nos abonnements de coaching</Link>
          <Link href="/coaching" className="text-gray-600 hover:text-blue-600 font-medium">Le Coaching mental c'est quoi ?</Link>
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 font-semibold hover:underline">
                Se déconnecter
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-blue-600 font-semibold hover:underline">
              S’identifier
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden ml-4">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-4 space-y-3">
          <Link href="/#themes" className="block text-gray-700 font-medium">Nos Thèmes</Link>
          <Link href="/coach" className="block text-gray-700 font-medium">Nos abonnements de coaching</Link>
          <Link href="/coaching" className="block text-gray-700 font-medium">Le Coaching mental c'est quoi ?</Link>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block text-red-600 font-medium mt-2">Se déconnecter</button>
          ) : (
            <Link href="/login" className="block text-blue-600 font-medium">S’identifier</Link>
          )}
        </div>
      )}
    </header>
  )
}
