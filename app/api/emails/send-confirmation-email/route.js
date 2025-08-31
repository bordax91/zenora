import { resend } from '@/lib/resend'

export async function POST(req) {
  try {
    const {
      to,
      coachName,
      clientName,
      date,
      time,
      packageTitle,
    } = await req.json()

    if (!to || !coachName || !clientName || !date || !time || !packageTitle) {
      return new Response(
        JSON.stringify({ error: 'Paramètres requis manquants' }),
        { status: 400 }
      )
    }

    const subject = `Confirmation de votre rendez-vous avec ${coachName}`

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: auto; padding: 20px;">
            <h2>Bonjour ${clientName},</h2>
            <p>Votre rendez-vous avec <strong>${coachName}</strong> est bien confirmé ✅</p>
            <p><strong>📅 Date :</strong> ${date}</p>
            <p><strong>🕐 Heure :</strong> ${time}</p>
            <p><strong>💬 Offre :</strong> ${packageTitle}</p>
            <br />
            <p>Merci de votre confiance 🙏</p>
            <p>L’équipe Zenora</p>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: 'Zenora <contact@zenoraapp.com>',
      to,
      subject,
      html,
    })

    return new Response(JSON.stringify({ success: true, result }), { status: 200 })
  } catch (error) {
    console.error('Erreur envoi email confirmation :', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    })
  }
}
