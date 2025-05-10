'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    <header className="w-full bg-white shadow-md px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
          <span className="text-lg font-semibold text-gray-800">Zenora</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/#themes" className="text-gray-600 hover:text-blue-600 font-medium">
            Nos Thèmes
          </Link>
          <Link href="/coach" className="text-gray-600 hover:text-blue-600 font-medium">
            Nos abonnements de coaching
          </Link>
          <Link href="/coaching" className="text-gray-600 hover:text-blue-600 font-medium">
            Le Coaching mental c'est quoi ?
          </Link>

          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">{userEmail}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 font-semibold hover:underline">
                Se déconnecter
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-blue-600 font-semibold hover:underline">
              S’identifier
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2"
               viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 text-center">
          <Link href="/#themes" className="block text-gray-600 hover:text-blue-600 font-medium">
            Nos Thèmes
          </Link>
          <Link href="/coach" className="block text-gray-600 hover:text-blue-600 font-medium">
            Nos abonnements de coaching
          </Link>
          <Link href="/coaching" className="block text-gray-600 hover:text-blue-600 font-medium">
            Le Coaching mental c'est quoi ?
          </Link>
          {isAuthenticated ? (
            <>
              <span className="block text-sm text-gray-600">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link href="/login" className="block text-sm text-blue-600 font-semibold hover:underline">
              S’identifier
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
