// /app/api/emails/send-confirmation-email/route.js

import { resend } from '@/lib/resend'

export async function sendClientConfirmationEmail({ to, clientName, coachName, date, time, packageTitle }) {
  const subject = `Confirmation de votre rendez-vous avec ${coachName}`
  const html = `
    <div>
      <h2>Bonjour ${clientName},</h2>
      <p>Votre rendez-vous avec <strong>${coachName}</strong> est bien confirmé.</p>
      <p><strong>Date :</strong> ${date}</p>
      <p><strong>Heure :</strong> ${time}</p>
      <p><strong>Offre :</strong> ${packageTitle}</p>
      <br />
      <p>Merci de votre confiance 🙏</p>      
      <p>— L'équipe Zenora</p>
    </div>
  `

  return await resend.emails.send({
    from: 'Zenora <contact@zenoraapp.com>',
    to,
    subject,
    html
  })
}

export async function sendCoachConfirmationEmail({ to, coachName, clientName, date, time, packageTitle }) {
  const subject = `Un rendez-vous vient d’être réservé par ${clientName}`
  const html = `
    <div>
      <h2>Bonjour ${coachName},</h2>
      <p>Un nouveau rendez-vous a été réservé par <strong>${clientName}</strong>.</p>
      <p><strong>Date :</strong> ${date}</p>
      <p><strong>Heure :</strong> ${time}</p>
      <p><strong>Offre :</strong> ${packageTitle}</p>
      <br />
      <p>Connectez-vous à votre espace coach pour voir les détails.</p>
      <p>— L’équipe Zenora</p>
    </div>
  `

  return await resend.emails.send({
    from: 'Zenora <contact@zenoraapp.com>',
    to,
    subject,
    html
  })
}
