'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ClientOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffers = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          package:package_id (
            id,
            title,
            description,
            price
          )
        `)
        .eq('client_id', user.id)

      if (error) {
        console.error('Erreur chargement des offres :', error)
      } else {
        // Ne garder que les packages uniques (par ID)
        const unique = {}
        data.forEach(({ package: p }) => {
          if (p && !unique[p.id]) {
            unique[p.id] = p
          }
        })
        setOffers(Object.values(unique))
      }

      setLoading(false)
    }

    fetchOffers()
  }, [])

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🎁 Mes offres achetées
      </h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : offers.length === 0 ? (
        <p className="text-center text-gray-500">Aucune offre réservée pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {offers.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <h2 className="text-lg font-semibold mb-2">{p.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{p.description}</p>
              <p className="text-sm font-bold text-blue-600">{p.price} €</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
