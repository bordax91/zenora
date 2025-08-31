import { resend } from '@/lib/resend'

export async function POST(req) {
  try {
    const { to, coachName } = await req.json()

    if (!to || !coachName) {
      return new Response(
        JSON.stringify({ error: 'Paramètres requis manquants (to, coachName)' }),
        { status: 400 }
      )
    }

    const subject = `Bienvenue sur Zenora, ${coachName || 'Coach'} !`

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: auto; padding: 20px;">
            <h2>Bonjour ${coachName || 'Coach'},</h2>
            <p>Bienvenue parmi les coachs Zenora ✨</p>
            <p>Votre profil est maintenant actif et vous pouvez désormais proposer vos offres et recevoir des rendez-vous.</p>
            <p>Voici quelques liens utiles pour démarrer :</p>
            <ul>
              <li><a href="https://zenoraapp.com/coach/edit">✏️ Modifier mon profil</a></li>
              <li><a href="https://zenoraapp.com/coach/packages">📦 Créer mes offres</a></li>
              <li><a href="https://zenoraapp.com/coach/settings">⚙️ Gérer mes paramètres</a></li>
            </ul>
            <br />
            <p>Bon coaching !</p>
            <p>L'équipe Zenora</p>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: 'Zenora <contact@zenoraapp.com>',
      to,
      subject,
      html,
      reply_to: 'support@zenoraapp.com',
    })

    return new Response(JSON.stringify({ success: true, result }), { status: 200 })
  } catch (error) {
    console.error('Erreur envoi email bienvenue coach :', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    })
  }
}
