import crypto from "crypto"

export async function POST(req) {
  try {
    const body = await req.json()
    const { event, userData, customData } = body

    if (!event) {
      return new Response(JSON.stringify({ error: "Event manquant" }), { status: 400 })
    }

    // Hash email
    let hashedEmail
    if (userData?.email) {
      hashedEmail = crypto
        .createHash("sha256")
        .update(userData.email.trim().toLowerCase())
        .digest("hex")
    }

    // Nettoyer customData
    let cleanCustomData = { ...customData }
    if (cleanCustomData?.value === 0) {
      delete cleanCustomData.value
      delete cleanCustomData.currency
    }

    // Payload TikTok
    const payload = {
      pixel_code: process.env.TIKTOK_PIXEL_ID,
      event, // ex: "CompleteRegistration"
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      context: {
        page: {
          url: "https://zenoraapp.com",
          referrer: ""
        },
        user: hashedEmail ? { email: [hashedEmail] } : {},
        ip: req.headers.get("x-forwarded-for") || "0.0.0.0",
        user_agent: req.headers.get("user-agent") || ""
      },
      properties: cleanCustomData
    }

    // Envoi API TikTok
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": process.env.TIKTOK_ACCESS_TOKEN,
      },
      body: JSON.stringify(payload),
    })

    const result = await res.json()

    if (!res.ok) {
      console.error("TikTok API error:", result)
      return new Response(JSON.stringify({ error: result }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, result }), { status: 200 })
  } catch (err) {
    console.error("Erreur API TikTok:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
