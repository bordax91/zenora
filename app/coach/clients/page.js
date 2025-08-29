'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (!user) return router.push('/login')

      // 🔐 Vérifie abonnement ou essai
      const { data: profile, error } = await supabase
        .from('users')
        .select('trial_start, trial_end, is_subscribed')
        .eq('id', user.id)
        .single()

      if (error || !profile) return router.push('/login')

      const now = new Date()
      const trialEnd = profile.trial_end
        ? new Date(profile.trial_end)
        : profile.trial_start
        ? new Date(new Date(profile.trial_start).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null

      const isTrialExpired = trialEnd ? now > trialEnd : true
      const isSubscribed = profile.is_subscribed === true

      if (isTrialExpired && !isSubscribed) {
        return router.push('/coach/subscribe')
      }

      // ✅ Fetch des clients liés aux sessions
      const { data, error: clientError } = await supabase
        .from('sessions')
        .select(`
          client_id,
          client:client_id (id, name, email)
        `)
        .eq('coach_id', user.id)

      if (clientError) {
        console.error('Erreur fetch clients', clientError)
        return
      }

      const uniqueClientsMap = new Map()
      data?.forEach((s) => {
        if (s.client?.id) {
          uniqueClientsMap.set(s.client.id, s.client)
        }
      })

      setClients(Array.from(uniqueClientsMap.values()))
      setLoading(false)
    }

    checkAccessAndFetch()
  }, [])

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👥 Vos clients</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/coach/clients/${client.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {client.name || '—'}
                  </Link>
                </td>
                <td className="px-4 py-3">{client.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
