'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      setIsAuthenticated(!!session)

      if (session?.user?.id) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (!error && userData?.role) {
          setUserRole(userData.role)
        }
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)

      if (session?.user?.id) {
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.role) setUserRole(data.role)
          })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUserRole(null)
    router.push('/login')
  }

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 scroll-smooth">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Zenora" width={40} height={40} />
          <span className="text-lg font-semibold text-gray-800">Zenora</span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-gray-600 hover:text-blue-600 font-medium">Tarifs</Link>
          <Link href="/#pour-qui" className="text-gray-600 hover:text-blue-600 font-medium">Pour qui ?</Link>
          <Link href="/#faq" className="text-gray-600 hover:text-blue-600 font-medium">FAQ</Link>
          {userRole && (
            <Link
              href={userRole === 'coach' ? '/coach/dashboard' : '/client/dashboard'}
              className="text-blue-600 font-medium hover:underline"
            >
              Mon espace
            </Link>
          )}
        </nav>

        {/* Actions (login/register) desktop */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="text-blue-600 font-medium">
                S’identifier
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Essayer gratuitement
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                Se déconnecter
              </button>
            </>
          )}
        </div>

        {/* Mobile menu + bouton "Essayer" */}
        <div className="md:hidden flex items-center gap-2">
          {!isAuthenticated && (
            <Link
              href="/register"
              className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 transition font-medium"
            >
              Essayer
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-inner px-6 pb-4 pt-2 space-y-3">
          <Link href="/pricing" className="block text-gray-700 hover:text-blue-600 font-medium">
            Tarifs
          </Link>
          <Link href="/#pour-qui" className="block text-gray-700 hover:text-blue-600 font-medium">
            Pour qui ?
          </Link>
          <Link href="/#faq" className="block text-gray-700 hover:text-blue-600 font-medium">
            FAQ
          </Link>
          {userRole && (
            <Link
              href={userRole === 'coach' ? '/coach/dashboard' : '/client/dashboard'}
              className="block text-blue-600 font-medium hover:underline"
            >
              Mon espace
            </Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="block text-blue-600 font-medium">
                S’identifier
              </Link>
              <Link
                href="/register"
                className="block bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition"
              >
                Essayer gratuitement
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="block text-sm text-red-600 font-semibold hover:underline"
            >
              Se déconnecter
            </button>
          )}
        </div>
      )}
    </header>
  )
}
