import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const now = DateTime.now().setZone('Europe/Paris').toUTC().toISO()

    const { error } = await supabase
      .from('availabilities')
      .delete()
      .lt('date', now)
      .eq('is_booked', false)

    if (error) {
      console.error(error)
      return new NextResponse('Erreur suppression', { status: 500 })
    }

    return new NextResponse('Créneaux passés supprimés ✅', { status: 200 })
  } catch (e) {
    console.error(e)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
