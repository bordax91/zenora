'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default function CoachLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const supabase = createBrowserSupabaseClient()

  const links = [
    { href: '/coach/dashboard', label: 'Rendez-vous' },
    { href: '/coach/availability', label: 'Disponibilités' },
    { href: '/coach/clients', label: 'Clients' },
    { href: '/coach/packages', label: 'Offres / Forfaits' },
    { href: '/coach/sales', label: 'Ventes' },
    { href: '/coach/integrations', label: 'Intégrations' },
    { href: '/coach/settings', label: 'Paramètres' },
  ]

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('trial_start, trial_end, is_subscribed')
        .eq('id', user.id)
        .single()

      if (!profile || error) {
        router.push('/login')
        return
      }

      const now = new Date()
      let trialEnd = null

      if (profile.trial_end) {
        trialEnd = new Date(profile.trial_end)
      } else if (profile.trial_start) {
        const trialStart = new Date(profile.trial_start)
        trialEnd = new Date(trialStart)
        trialEnd.setDate(trialStart.getDate() + 7)
      }

      const isTrialExpired = trialEnd ? now > trialEnd : true
      const isSubscribed = profile.is_subscribed === true

      if (isTrialExpired && !isSubscribed) {
        router.push('/coach/subscribe')
      } else {
        setAccessGranted(true)
      }
    }

    checkAccess()
  }, [])

  if (!accessGranted) {
    return null // ou <p>Chargement...</p>
  }

  const NavLinks = () => (
    <>
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
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/coach/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Zenora Logo"
              width={36}
              height={36}
              className="rounded"
            />
            <span className="font-bold text-lg text-gray-800">Zenora</span>
          </Link>

          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="hidden md:flex gap-6">
            <NavLinks />
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-3 rounded ${
                    pathname === link.href
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
