'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState(null)
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
    <header className="w-full px-6 py-4 flex items-center justify-between bg-white shadow-md">
      {/* Logo + navigation à gauche */}
      <div className="flex items-center gap-8">
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

        <nav className="flex gap-6 ml-8">
          <Link href="/programmes" className="text-gray-600 hover:text-blue-600 font-medium">
            Nos Thèmes
          </Link>
          <Link href="/coach" className="text-gray-600 hover:text-blue-600 font-medium">
            Nos abonnements de coaching
          </Link>
          <Link href="/coaching" className="text-gray-600 hover:text-blue-600 font-medium">
            Le Coaching mental c'est quoi ?
          </Link>
        </nav>
      </div>

      {/* Auth à droite */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>
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
    </header>
  )
}
