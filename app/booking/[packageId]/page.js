'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import CoachCalendar from '@/components/CoachCalendar'

export default function BookingPage() {
  const { packageId } = useParams()
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🏁 useEffect lancé')

    const fetchPackage = async () => {
      console.log('📦 packageId reçu depuis l’URL :', packageId)

      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId?.toString()) // on sécurise avec ?
        .maybeSingle()

      if (error) {
        console.error('❌ Erreur récupération package:', error)
      } else {
        console.log('✅ Package récupéré :', data)
        setPkg(data)
      }

      setLoading(false)
    }

    if (packageId) {
      fetchPackage()
    } else {
      console.warn('⚠️ Aucun packageId trouvé dans l’URL')
      setLoading(false)
    }
  }, [packageId])

  if (loading) return <p className="text-center py-10">Chargement...</p>
  if (!pkg) return <p className="text-center py-10 text-red-500">Offre introuvable.</p>

  return (
    <div className="w-full px-4 md:px-10 py-6 space-y-8">
      {/* Bloc infos package */}
      <div className="w-full bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-2">{pkg.title}</h1>
        <p className="mb-2 text-gray-700">{pkg.description}</p>
        <p className="mb-2 font-semibold text-lg">Prix : {pkg.price}€</p>
        <p className="text-sm text-gray-500">
          Sélectionnez une date ci-dessous pour continuer la réservation.
        </p>
      </div>

      {/* Calendrier du coach */}
      {pkg.coach_id && (
        <div className="w-full bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <CoachCalendar coachId={pkg.coach_id} packageId={packageId} />
        </div>
      )}
    </div>
  )
}
