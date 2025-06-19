import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { raison, attentes, theme, email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email manquant' }, { status: 400 })
  }

  await resend.emails.send({
    from: 'from: 'onboarding@resend.dev',',
    to: 'contact@zenoraapp.com', // ou une autre adresse de réception
    subject: '🧠 Nouveau formulaire coaching Zenora',
    html: `
      <h3>Formulaire de coaching complété</h3>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Raison :</strong> ${raison}</p>
      <p><strong>Attentes :</strong> ${attentes}</p>
      <p><strong>Thème :</strong> ${theme}</p>
    `
  })

  return NextResponse.json({ status: 'email envoyé' })
}
