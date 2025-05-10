'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

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
    <header className="w-full px-6 py-4 bg-white shadow-md flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} className="w-auto h-10" />
        <span className="text-lg font-semibold text-gray-800">Zenora</span>
      </Link>

      {/* Desktop Nav */}
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
            <span className="text-sm text-gray-600">{userEmail}</span>
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

      {/* Mobile Menu Toggle */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-t border-gray-200 shadow-md px-6 py-4 md:hidden flex flex-col gap-4 z-50">
          <Link href="/#themes" className="text-gray-700" onClick={() => setMenuOpen(false)}>Nos Thèmes</Link>
          <Link href="/coach" className="text-gray-700" onClick={() => setMenuOpen(false)}>Nos abonnements de coaching</Link>
          <Link href="/coaching" className="text-gray-700" onClick={() => setMenuOpen(false)}>Le Coaching mental c'est quoi ?</Link>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">{userEmail}</span>
              <button onClick={handleLogout} className="text-red-600 text-left font-medium">Se déconnecter</button>
            </>
          ) : (
            <Link href="/login" className="text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>S’identifier</Link>
          )}
        </div>
      )}
    </header>
  )
}
