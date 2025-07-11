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
      html: `
        <p>Bonjour ${prenom || ''},</p>
        <p>Voici le guide que tu as demandé : <strong>Quel est ton profil après une rupture ?</strong></p>
        <p>👇 Télécharge-le ici :</p>
        <p><a href="https://zenoraapp.com/leadmagnet-profil-post-rupture.pdf" target="_blank">📥 Télécharger le guide (PDF)</a></p>
        <br />
        <p>Si tu ne l’as pas demandé, ignore simplement ce message.</p>
        <p>Avec bienveillance,<br>L’équipe Zenora</p>
      `
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return Response.json({ error: 'Erreur lors de l’envoi de l’email' }, { status: 500 })
  }
}
