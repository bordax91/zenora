// /app/api/send-formulaire/route.js

import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email manquant' }, { status: 400 })
  }

  await resend.emails.send({
    from: 'contact@zenoraapp.com',
    to: email,
    subject: "Prépare ta session Zenora 🧘",
    html: `
      <p>Merci pour ton inscription !</p>
      <p>Avant ta première séance, merci de remplir ce formulaire (1 min) :</p>
      <p><a href="https://zenoraapp.com/formulaire-coaching" target="_blank">→ Accéder au formulaire</a></p>
    `,
  })

  return NextResponse.json({ status: 'email envoyé' })
}
