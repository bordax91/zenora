import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { user_id } = await req.json()
    if (!user_id) return new Response('user_id requis', { status: 400 })

    // Récupération du template
    const { data: templates, error: templateError } = await supabase
      .from('availability_template')
      .select('*')
      .eq('coach_id', user_id)

    if (templateError) {
      console.error(templateError)
      return new Response('Erreur chargement template', { status: 500 })
    }

    const now = DateTime.now().setZone('Europe/Paris')
    const next14Days = [...Array(14)].map((_, i) =>
      now.plus({ days: i }).startOf('day')
    )

    const availabilities = []

    next14Days.forEach((day) => {
      const weekday = day.weekday % 7 // Luxon : lundi = 1, dimanche = 7 → on veut 0–6

      templates.forEach((template) => {
        if (template.day_of_week === weekday) {
          const [hour, minute] = template.start_time.split(':')

          const localDateTime = day.set({
            hour: parseInt(hour),
            minute: parseInt(minute),
            second: 0,
            millisecond: 0
          })

          const utcISO = localDateTime.toUTC().toISO()

          availabilities.push({
            coach_id: user_id,
            date: utcISO,
            is_booked: false
          })
        }
      })
    })

    // Supprimer les anciens créneaux à venir
    await supabase
      .from('availabilities')
      .delete()
      .eq('coach_id', user_id)
      .gte('date', now.toUTC().toISO())

    // Insérer les nouveaux créneaux
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
