import { resend } from '@/lib/resend'

export async function sendWelcomeCoachEmail({ to, coachName }) {
  const subject = `Bienvenue sur Zenora, ${coachName} !`
  const html = `
    <div>
      <h2>Bonjour ${coachName},</h2>
      <p>Bienvenue parmi les coachs Zenora ✨</p>
      <p>Votre profil est maintenant actif et vous pouvez désormais proposer vos offres et recevoir des rendez-vous.</p>
      <p>Voici quelques liens utiles pour démarrer :</p>
      <ul>
        <li><a href="https://zenoraapp.com/coach/edit">Modifier mon profil</a></li>
        <li><a href="https://zenoraapp.com/coach/packages">Créer mes offres</a></li>
        <li><a href="https://zenoraapp.com/coach/settings">Gérer mes paramètres</a></li>
      </ul>
      <br />
      <p>Bonne coaching !</p>
      <p>L'équipe Zenora</p>
    </div>
  `

  return await resend.emails.send({
    from: 'Zenora <noreply@zenoraapp.com>',
    to,
    subject,
    html,
  })
}
