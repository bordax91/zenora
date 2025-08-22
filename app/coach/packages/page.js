'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const fetchUserAndPackages = async () => {
      // Récupère l'utilisateur connecté
      const { data: authData, error: authError } = await supabase.auth.getUser()
      const user = authData?.user

      if (!user) {
        console.error("Utilisateur non connecté")
        setLoading(false)
        return
      }

      setUserId(user.id)

      // Récupère les packages du coach connecté
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement packages:', error)
      } else {
        setPackages(data || [])
      }

      setLoading(false)
    }

    fetchUserAndPackages()
  }, [])

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Supprimer cette offre ?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Erreur lors de la suppression")
      console.error(error)
    } else {
      setPackages(prev => prev.filter(pkg => pkg.id !== id))
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Offres</h1>
        <Link
          href="/coach/packages/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nouvelle offre
        </Link>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : packages.length === 0 ? (
        <p className="text-gray-600">Aucune offre trouvée.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map(pkg => (
            <div key={pkg.id} className="border p-4 rounded shadow-sm bg-white relative">
              <h2 className="text-lg font-semibold">{pkg.title}</h2>
              <p className="text-sm text-gray-600">{pkg.description}</p>
              <p className="mt-2 font-medium">{pkg.price} €</p>

              <button
                onClick={() => handleDelete(pkg.id)}
                className="mt-4 text-red-600 hover:underline text-sm"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
