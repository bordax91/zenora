// app/api/test-send-email/route.js

import { resend } from '@/lib/resend'

export async function POST() {
  try {
    const result = await resend.emails.send({
      from: 'Zenora <contact@zenoraapp.com>',
      to: 'ton-adresse@test.com',
      subject: 'Test Email Zenora',
      html: `<p>Ceci est un email test depuis Vercel</p>`,
    })

    return Response.json({ success: true, result })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
