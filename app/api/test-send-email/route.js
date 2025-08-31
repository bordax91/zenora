import { resend } from '@/lib/resend'

export async function GET() {
  try {
    const result = await resend.emails.send({
      from: 'Zenora <contact@zenoraapp.com>',
      to: 'ton@email.com', // Mets ton adresse réelle ici
      subject: '✅ Test email depuis Zenora',
      html: `<p>Ceci est un email de test depuis Vercel avec Resend.</p>`,
    })

    return Response.json({ success: true, result })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
