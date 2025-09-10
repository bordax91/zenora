import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const now = DateTime.now().setZone('Europe/Paris')
    const nowUTC = now.toUTC().toISO()

    // 🔴 Supprimer les créneaux passés non réservés
    await supabase
      .from('availabilities')
      .delete()
      .lt('date', nowUTC)
      .eq('is_booked', false)

    // 🔄 Récupérer tous les templates
    const { data: templates, error } = await supabase
      .from('availability_template')
      .select('*')

    if (error) {
      console.error('Erreur récupération templates :', error.message)
      return new NextResponse('Erreur template', { status: 500 })
    }

    const coaches = [...new Set(templates.map(t => t.coach_id))]

    for (const coachId of coaches) {
      const userTemplates = templates.filter(t => t.coach_id === coachId)

      // 🔄 Récupérer les dates déjà existantes
      const { data: existingSlots, error: slotErr } = await supabase
        .from('availabilities')
        .select('date')
        .eq('coach_id', coachId)

      if (slotErr) {
        console.error('Erreur récupération slots existants', slotErr.message)
        continue
      }

      const existingDatesSet = new Set(
        (existingSlots || []).map(s =>
          DateTime.fromISO(s.date).toUTC().toISO()
        )
      )

      const slotsToInsert = []
      const today = now.startOf('day')

      for (let i = 0; i < 30; i++) {
        const currentDate = today.plus({ days: i })

        for (const tpl of userTemplates) {
          if (currentDate.weekday % 7 === tpl.day_of_week) {
            const duration = tpl.duration || 60
            const [sh, sm] = tpl.start_time.split(':').map(Number)
            const [eh, em] = tpl.end_time.split(':').map(Number)

            let slotStart = DateTime.fromObject(
              {
                year: currentDate.year,
                month: currentDate.month,
                day: currentDate.day,
                hour: sh,
                minute: sm
              },
              { zone: 'Europe/Paris' }
            )

            const slotEnd = DateTime.fromObject(
              {
                year: currentDate.year,
                month: currentDate.month,
                day: currentDate.day,
                hour: eh,
                minute: em
              },
              { zone: 'Europe/Paris' }
            )

            while (slotStart.plus({ minutes: duration }) <= slotEnd) {
              const isoSlot = slotStart.toUTC().toISO()

              // ⚠️ Anti-doublon : on skip si ce créneau existe déjà
              if (!existingDatesSet.has(isoSlot)) {
                slotsToInsert.push({
                  coach_id: coachId,
                  date: isoSlot,
                  is_booked: false
                })
              }

              slotStart = slotStart.plus({ minutes: duration })
            }
          }
        }
      }

      if (slotsToInsert.length > 0) {
        await supabase.from('availabilities').insert(slotsToInsert)
      }
    }

    return new NextResponse('Créneaux régénérés sans doublons ✅', { status: 200 })
  } catch (e) {
    console.error('Erreur globale :', e)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
