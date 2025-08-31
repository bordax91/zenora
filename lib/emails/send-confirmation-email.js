import { resend } from '@/lib/resend'

export async function sendConfirmationEmail({ to, coachName, clientName, date, time, packageTitle }) {
  const subject = `Confirmation de votre rendez-vous avec ${coachName}`
  const html = `
    <div>
      <h2>Bonjour ${clientName},</h2>
      <p>Votre rendez-vous avec <strong>${coachName}</strong> est bien confirmé.</p>
      <p><strong>Date :</strong> ${date}</p>
      <p><strong>Heure :</strong> ${time}</p>
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
