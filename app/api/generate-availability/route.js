import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { user_id } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id requis' }), { status: 400 })
    }

    // Supprimer les créneaux passés non réservés
    const now = DateTime.now().setZone('Europe/Paris').toISO()
    await supabase
      .from('availabilities')
      .delete()
      .lt('date', now)
      .eq('is_booked', false)

    // Récupérer les templates du coach
    const { data: templates, error: templateError } = await supabase
      .from('availability_template')
      .select('*')
      .eq('coach_id', user_id)

    if (templateError) {
      console.error(templateError)
      return new Response(JSON.stringify({ error: 'Erreur template : ' + templateError.message }), { status: 500 })
    }

    const slots = []
    const nowDate = DateTime.now().setZone('Europe/Paris').startOf('day')

    for (let i = 0; i < 14; i++) {
      const currentDate = nowDate.plus({ days: i })

      for (const tpl of templates) {
        if (currentDate.weekday % 7 === tpl.day_of_week) {
          const duration = tpl.duration || 60 // durée en minutes (par défaut 60)
          const [sh, sm] = tpl.start_time.split(':').map(Number)
          const [eh, em] = tpl.end_time.split(':').map(Number)

          let slotStart = currentDate.set({ hour: sh, minute: sm })
          const slotEnd = currentDate.set({ hour: eh, minute: em })

          while (slotStart.plus({ minutes: duration }) <= slotEnd) {
            slots.push({
              coach_id: user_id,
              date: slotStart.toUTC().toISO(),
              is_booked: false
            })

            slotStart = slotStart.plus({ minutes: duration })
          }
        }
      }
    }

    const { error: insertError } = await supabase.from('availabilities').insert(slots)
    if (insertError) {
      console.error(insertError)
      return new Response(JSON.stringify({ error: 'Erreur insertion : ' + insertError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Créneaux générés avec succès ✅' }), { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 })
  }
}
