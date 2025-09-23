import { NextResponse } from 'next/server'

export async function POST(req) {
  const { event, userData, customData } = await req.json()

  const res = await fetch('https://business-api.tiktokglobalshop.com/open_api/v1.3/event/track/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': process.env.TIKTOK_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      pixel_code: process.env.TIKTOK_PIXEL_ID,
      event,
      context: {
        page: { url: 'https://zenoraapp.com' },
        user: userData,
      },
      properties: customData,
    }),
  })

  const data = await res.json()
  return NextResponse.json(data)
}
