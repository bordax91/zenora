import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST() {
  try {
    const { data: authData } = await supabase.auth.getUser()
    const coach = authData?.user
    if (!coach) return new Response('Non autorisé', { status: 401 })

    const { data: templates } = await supabase
      .from('availability_template')
      .select('*')
      .eq('coach_id', coach.id)

    const now = new Date()
    const next14Days = [...Array(14)].map((_, i) => {
      const date = new Date()
      date.setDate(now.getDate() + i)
      return date
    })

    const availabilities = []

    next14Days.forEach(date => {
      const day = date.getDay() // 0=dimanche, 1=lundi, etc.

      templates
        .filter(t => t.day_of_week === day)
        .forEach(t => {
          const [hour, minute] = t.start_time.split(':')
          const slotDate = new Date(date)
          slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0)

          availabilities.push({
            coach_id: coach.id,
            date: slotDate.toISOString()
          })
        })
    })

    // Supprimer les anciennes dispo à venir (optionnel)
    await supabase
      .from('availabilities')
      .delete()
      .eq('coach_id', coach.id)
      .gte('date', now.toISOString())

    const { error } = await supabase
      .from('availabilities')
      .insert(availabilities)

    if (error) return new Response('Erreur insertion', { status: 500 })

    return new Response('Disponibilités générées ✅', { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('Erreur serveur', { status: 500 })
  }
}
