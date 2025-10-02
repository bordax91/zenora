import crypto from "crypto"

export async function POST(req) {
  try {
    const body = await req.json()
    const { event, email, external_id } = body

    if (!event) {
      return new Response(JSON.stringify({ error: "Event manquant" }), { status: 400 })
    }

    // Hash email si dispo
    let hashedEmail = null
    if (email) {
      hashedEmail = crypto
        .createHash("sha256")
        .update(email.trim().toLowerCase())
        .digest("hex")
    }

    // Récup IP + User-Agent
    const ip = req.headers.get("x-forwarded-for") || "0.0.0.0"
    const userAgent = req.headers.get("user-agent") || ""

    // Payload Reddit CAPI
    const payload = {
      test_mode: false, // passe à true pour tester
      events: [
        {
          event_at: new Date().toISOString(), // ISO 8601
          event_type: event, // ex: "SignUp"
          tracking_type: "Standard",
          user: {
            email: hashedEmail,
            ip_address: ip,
            user_agent: userAgent,
            external_id: external_id || null,
          },
        },
      ],
    }

    const res = await fetch(
      `https://ads-api.reddit.com/api/v2.0/conversions/events/${process.env.REDDIT_PIXEL_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REDDIT_ACCESS_TOKEN}`, // ⚠️ Access token généré dans Reddit Ads
        },
        body: JSON.stringify(payload),
      }
    )

    const result = await res.json()

    if (!res.ok) {
      console.error("Reddit API error:", result)
      return new Response(JSON.stringify({ error: result }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, result }), { status: 200 })
  } catch (err) {
    console.error("Erreur Reddit API:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
