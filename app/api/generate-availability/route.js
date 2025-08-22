import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { user_id } = await req.json()
    if (!user_id) return new Response('user_id requis', { status: 400 })

    const { data: templates, error: templateError } = await supabase
      .from('availability_template')
      .select('*')
      .eq('coach_id', user_id)

    if (templateError) {
      console.error(templateError)
      return new Response('Erreur chargement template', { status: 500 })
    }

    const now = new Date()
    const next14Days = [...Array(14)].map((_, i) => {
      const d = new Date()
      d.setDate(now.getDate() + i)
      return d
    })

    const availabilities = []

    next14Days.forEach((date) => {
      const weekdayNumber = date.getDay() // 0 = dimanche

      templates.forEach((template) => {
        if (template.day_of_week === weekdayNumber) {
          const [hour, minute] = template.start_time.split(':')
          const slotDate = new Date(date)
          slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0)

          availabilities.push({
            coach_id: user_id,
            date: slotDate.toISOString(),
            is_booked: false,
          })
        }
      })
    })

    // Supprimer les anciennes dispos à venir
    await supabase
      .from('availabilities')
      .delete()
      .eq('coach_id', user_id)
      .gte('date', now.toISOString())

    const { error: insertError } = await supabase
      .from('availabilities')
      .insert(availabilities)

    if (insertError) {
      console.error(insertError)
      return new Response('Erreur insertion', { status: 500 })
    }

    return new Response('Créneaux générés avec succès ✅', { status: 200 })

  } catch (e) {
    console.error(e)
    return new Response('Erreur serveur', { status: 500 })
  }
}
