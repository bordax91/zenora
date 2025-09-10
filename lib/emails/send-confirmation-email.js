import { resend } from '@/lib/resend'

export async function sendConfirmationEmail({ to, coachName, clientName, date, packageTitle }) {
  // On part du principe que "date" est une string ISO (UTC), ex : "2025-09-16T07:00:00Z"
  const dateObj = new Date(date)

  // Convertir en heure locale Europe/Paris
  const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  const timeFormatted = dateObj.toLocaleTimeString('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const subject = `Confirmation de votre rendez-vous avec ${coachName}`
  const html = `
    <div>
      <h2>Bonjour ${clientName},</h2>
      <p>Votre rendez-vous avec <strong>${coachName}</strong> est bien confirmé.</p>
      <p><strong>Date :</strong> ${dateFormatted}</p>
      <p><strong>Heure :</strong> ${timeFormatted}</p>
      <p><strong>Offre :</strong> ${packageTitle}</p>
      <br />
      <p>Merci de votre confiance</p>      
    </div>
  `

  return await resend.emails.send({
    from: 'Zenora <contact@zenoraapp.com>',
    to,
    subject,
    html,
  })
}
