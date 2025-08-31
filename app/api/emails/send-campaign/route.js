import { resend } from '@/lib/resend'

export async function POST(req) {
  try {
    const body = await req.json()
    const { to, subject, html } = body

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
        status: 400,
      })
    }

    const response = await resend.emails.send({
      from: 'Zenora <contact@zenoraapp.com>',
      to,
      subject,
      html,
    })

    return new Response(JSON.stringify({ success: true, data: response }), {
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erreur envoi campagne email :', error)
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
    })
  }
}
