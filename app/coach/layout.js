'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Calendar, Clock, Users, Package, BarChart, Plug, MessageSquare, Settings, Clipboard } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function CoachLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTrialBanner, setShowTrialBanner] = useState(false)
  const [trialEndFormatted, setTrialEndFormatted] = useState('')
  const [trialExpired, setTrialExpired] = useState(false)
  const [username, setUsername] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const links = [
    { href: '/coach/dashboard', label: 'Rendez-vous', icon: Calendar },
    { href: '/coach/availability', label: 'Disponibilités', icon: Clock },
    { href: '/coach/clients', label: 'Clients', icon: Users },
    { href: '/coach/packages', label: 'Offres / Forfaits', icon: Package },
    { href: '/coach/sales', label: 'Ventes', icon: BarChart },
    { href: '/coach/integrations', label: 'Intégrations', icon: Plug },
    { href: '/coach/prospection', label: 'Prospection', icon: MessageSquare },
    { href: '/coach/settings', label: 'Paramètres', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const copyToClipboard = () => {
    if (username) {
      navigator.clipboard.writeText(`https://zenoraapp.com/${username}`)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single()

      if (data?.username) setUsername(data.username)
    }

    const checkTrial = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('trial_start, trial_end, is_subscribed')
        .eq('id', user.id)
        .single()

      if (!profile || profile.is_subscribed) return

      const now = new Date()
      let trialEnd = null

      if (profile.trial_end) {
        trialEnd = new Date(profile.trial_end)
      } else if (profile.trial_start) {
        const trialStart = new Date(profile.trial_start)
        trialEnd = new Date(trialStart)
        trialEnd.setDate(trialStart.getDate() + 7)
      }

      const daysLeft = trialEnd ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : null

      if (daysLeft !== null && daysLeft <= 3) {
        setShowTrialBanner(true)
        setTrialExpired(daysLeft < 0)

        setTrialEndFormatted(
          trialEnd.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        )
      }
    }

    fetchUsername()
    checkTrial()
  }, [])

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-50 border-r p-4 hidden md:block">
        <Link href="/coach/dashboard" className="flex items-center gap-2 mb-8">
          <Image src="/logo.png" alt="Zenora Logo" width={36} height={36} className="rounded" />
          <span className="font-bold text-lg text-gray-800">Zenora</span>
        </Link>

        {username && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">🔗 Lien public</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/${username}`}
                target="_blank"
                className="text-blue-600 text-sm truncate"
              >
                zenoraapp.com/{username}
              </Link>
              <button
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-blue-600"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              {copySuccess && <span className="text-green-600 text-xs">✔️ Copié</span>}
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition ${
                pathname === href
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="mt-4 text-sm text-red-600 hover:underline"
          >
            Se déconnecter
          </button>
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/coach/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Zenora Logo" width={30} height={30} className="rounded" />
          <span className="font-bold text-lg text-gray-800">Zenora</span>
        </Link>

        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-50 border-b px-4 py-3">
          {username && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">🔗 Lien public</p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${username}`}
                  target="_blank"
                  className="text-blue-600 text-sm truncate"
                >
                  zenoraapp.com/{username}
                </Link>
                <button
                  onClick={copyToClipboard}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                {copySuccess && <span className="text-green-600 text-xs">✔️ Copié</span>}
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded ${
                  pathname === href
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            <button
              onClick={() => {
                setMenuOpen(false)
                handleLogout()
              }}
              className="text-left w-full py-2 px-3 text-red-600 hover:bg-gray-100"
            >
              Se déconnecter
            </button>
          </nav>
        </div>
      )}

      <div className="flex-1 min-h-screen">
        {showTrialBanner && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 px-4 py-3 text-sm">
            {trialExpired ? (
              <>
                ❌ Votre période d’essai est terminée.{' '}
                <Link href="/coach/subscribe" className="underline text-blue-600">
                  Souscrivez à une offre pour continuer
                </Link>.
              </>
            ) : (
              <>
                🎁 Votre période d’essai se termine le <strong>{trialEndFormatted}</strong>.{' '}
                <Link href="/coach/subscribe" className="underline text-blue-600">
                  Passer à l’abonnement
                </Link>.
              </>
            )}
          </div>
        )}

        <main className="p-4 md:p-6 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
