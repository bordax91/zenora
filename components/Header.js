'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
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
    <header className="w-full px-6 py-4 flex items-center justify-between bg-white shadow-md relative z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center hover:opacity-80 transition">
        <Image
          src="/logo.png"
          alt="Zenora Logo"
          width={40}
          height={40}
          className="w-auto h-10"
        />
        <span className="ml-2 text-lg font-semibold text-gray-800">Zenora</span>
      </Link>

      {/* Menu Desktop */}
      <nav className="hidden md:flex gap-6 ml-8">
        <Link href="/#themes" className="text-gray-600 hover:text-blue-600 font-medium">
          Nos Thèmes
        </Link>
        <Link href="/coach" className="text-gray-600 hover:text-blue-600 font-medium">
          Nos abonnements de coaching
        </Link>
        <Link href="/coaching" className="text-gray-600 hover:text-blue-600 font-medium">
          Le Coaching mental c'est quoi ?
        </Link>
      </nav>

      {/* Auth Desktop */}
      <div className="hidden md:flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 font-semibold hover:underline"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            S’identifier
          </Link>
        )}
      </div>

      {/* Menu Burger Mobile */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start px-6 py-4 space-y-4 md:hidden z-40">
          <Link href="/#themes" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
            Nos Thèmes
          </Link>
          <Link href="/coach" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
            Nos abonnements de coaching
          </Link>
          <Link href="/coaching" className="text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
            Le Coaching mental c'est quoi ?
          </Link>

          <div className="pt-4 border-t w-full">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 block mb-2">{userEmail}</span>
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="text-sm text-red-600 font-semibold hover:underline"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-blue-600 font-semibold hover:underline"
              >
                S’identifier
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
