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
      subject: 'Voici ton guide gratuit : Quel est ton profil après rupture ?',
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@zenoraapp.com>',
      },
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <p>Bonjour ${prenom ? prenom : 'à toi'},</p>

          <p>Merci d’avoir demandé ton guide <strong>"Quel est ton profil après une rupture ?"</strong>.</p>

          <p>📥 <a href="https://zenoraapp.com/leadmagnet-profil-post-rupture.pdf" target="_blank" style="color: #2563eb;">Clique ici pour le télécharger (PDF)</a></p>

          <p>Si tu n’es pas à l’origine de cette demande, tu peux ignorer ce message en toute sécurité.</p>

          <p style="margin-top: 30px;">Avec bienveillance,<br>L’équipe Zenora</p>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;" />
          <p style="font-size: 12px; color: #777;">
            Tu reçois cet email parce que tu as demandé un guide sur zenoraapp.com.<br>
            Si tu ne veux plus recevoir de message, tu peux <a href="mailto:unsubscribe@zenoraapp.com" style="color: #2563eb;">te désabonner ici</a>.
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
