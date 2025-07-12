import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { email, prenom } = await req.json()

  if (!email) {
    return Response.json({ error: 'Email manquant' }, { status: 400 })
  }

  try {
    const data = await resend.emails.send({
      from: 'Zenora <contact@zenoraapp.com>',
      to: email,
      subject: 'Ton guide est prêt à être téléchargé',
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@zenoraapp.com>',
      },
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
          <p>Bonjour ${prenom ? prenom : 'à toi'},</p>

          <p>Merci pour ta demande de guide. Tu peux le télécharger ici :</p>

          <p>
            👉 <a href="https://zenoraapp.com/leadmagnet-profil-post-rupture.pdf" target="_blank" style="color: #1d4ed8;">
              Télécharger le guide (PDF)
            </a>
          </p>

          <p>Si tu n’es pas à l’origine de cette demande, tu peux ignorer ce message.</p>

          <p>Bien à toi,<br>L’équipe Zenora</p>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;" />

          <p style="font-size: 12px; color: #777;">
            Cet e-mail t’a été envoyé suite à une demande sur <a href="https://zenoraapp.com" style="color: #555;">zenoraapp.com</a>.<br>
            Tu peux <a href="mailto:unsubscribe@zenoraapp.com" style="color: #555;">te désabonner ici</a> à tout moment.
          </p>
        </div>
      `
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return Response.json({ error: 'Erreur lors de l’envoi de l’email' }, { status: 500 })
  }
}
