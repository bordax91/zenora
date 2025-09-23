import crypto from "crypto"

export async function POST(req) {
  try {
    const body = await req.json()
    const { event, userData, customData } = body

    if (!event) {
      return new Response(JSON.stringify({ error: "Event manquant" }), { status: 400 })
    }

    // Hash SHA256 de l’email (TikTok exige les données hashées)
    let hashedEmail = null
    if (userData?.email) {
      hashedEmail = crypto.createHash("sha256").update(userData.email.trim().toLowerCase()).digest("hex")
    }

    // Préparer payload pour TikTok
    const payload = {
      pixel_code: process.env.TIKTOK_PIXEL_ID, // ex: D393M9RC77U5QJRHV9UG
      event,
      event_id: crypto.randomUUID(), // ID unique pour dédupliquer
      timestamp: Math.floor(Date.now() / 1000),
      context: {
        ad: {},
        page: {
          url: "https://zenoraapp.com",
          referrer: ""
        },
        user: {
          email: hashedEmail ? [hashedEmail] : []
        },
        ip: req.headers.get("x-forwarded-for") || "0.0.0.0",
        user_agent: req.headers.get("user-agent") || ""
      },
      properties: {
        ...customData
      }
    }

    // Envoi à TikTok API
    const res = await fetch("https://business-api.tiktokglobalshop.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": process.env.TIKTOK_ACCESS_TOKEN, // généré dans TikTok Events Manager
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
