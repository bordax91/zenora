'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      setIsAuthenticated(!!session)
      setUserEmail(session?.user?.email || null)

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
      setUserEmail(session?.user?.email || null)

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
    setUserEmail(null)
    setUserRole(null)
    router.push('/login')
  }

  return (
    <header className="w-full px-6 py-4 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Zenora" width={40} height={40} />
          <span className="text-lg font-semibold text-gray-800">Zenora</span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#themes" className="text-gray-600 hover:text-blue-600 font-medium">
            Nos Thèmes
          </Link>
          <Link href="/coach" className="text-gray-600 hover:text-blue-600 font-medium">
            Nos abonnements de coaching
          </Link>
          <Link href="/coaching" className="text-gray-600 hover:text-blue-600 font-medium">
            Le Coaching mental c'est quoi ?
          </Link>

          {userRole && (
            <Link
              href={userRole === 'coach' ? '/coach/dashboard' : '/client/dashboard'}
              className="text-blue-600 font-medium hover:underline"
            >
              Mon espace
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">{userEmail}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 font-semibold hover:underline">
                Se déconnecter
              </button>
            </>
          ) : (
            <Link href="/login" className="text-blue-600 font-medium">
              S’identifier
            </Link>
          )}
        </nav>

        {/* Burger menu mobile */}
        <div className="md:hidden flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">{userEmail}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 font-semibold">
                Se déconnecter
              </button>
            </>
          ) : (
            <Link href="/login" className="text-blue-600 font-medium">
              S’identifier
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
            ☰
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-3 px-6 pb-4">
          <Link href="/#themes" className="text-gray-700 hover:text-blue-600">Nos Thèmes</Link>
          <Link href="/coach" className="text-gray-700 hover:text-blue-600">Nos abonnements de coaching</Link>
          <Link href="/coaching" className="text-gray-700 hover:text-blue-600">Le Coaching mental c’est quoi ?</Link>
          {userRole && (
            <Link
              href={userRole === 'coach' ? '/coach/dashboard' : '/client/dashboard'}
              className="text-blue-600 hover:underline"
            >
              Mon espace
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
