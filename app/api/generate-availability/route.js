import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST() {
  try {
    const now = DateTime.now().setZone('Europe/Paris').toUTC().toISO()

    const { error } = await supabase
      .from('availabilities')
      .delete()
      .lt('date', now)
      .eq('is_booked', false) // ✅ On ne supprime que les créneaux non réservés

    if (error) {
      console.error(error)
      return new Response('Erreur suppression', { status: 500 })
    }

    return new Response('Créneaux passés supprimés ✅', { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('Erreur serveur', { status: 500 })
  }
}
