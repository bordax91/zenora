'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const coach = authData?.user
      if (!coach) return

      // On récupère les clients liés à ce coach via la table sessions
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          client_id,
          client:client_id (id, name, email)
        `)
        .eq('coach_id', coach.id)

      if (error) return console.error('Erreur fetch clients', error)

      // Dédupliquons les clients (si plusieurs sessions)
      const uniqueClientsMap = new Map()
      data?.forEach((s) => {
        if (s.client?.id) {
          uniqueClientsMap.set(s.client.id, s.client)
        }
      })

      setClients(Array.from(uniqueClientsMap.values()))
      setLoading(false)
    }

    fetchClients()
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
                  <Link href={`/coach/clients/${client.id}`} className="text-blue-600 hover:underline">
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
