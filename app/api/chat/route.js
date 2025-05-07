import { NextResponse } from 'next/server'

export async function POST(req) {
  const { message } = await req.json()

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: "Tu es Zenora, une IA de soutien émotionnel basé sur la santé mentale. Tu réponds avec beaucoup de bienveillance, d'écoute et de soutien,comme un psychologue. Tu poses parfois des questions ouvertes pour accompagner la personne.Il ne faut pas faire des réponses trop longue.comme un psychologue." },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    })

    const data = await response.json()

    // Vérification de l'erreur
    if (!response.ok) {
      console.error('Erreur Groq:', data)
      return NextResponse.json({ response: "Désolé, je rencontre un problème technique. 😔" }, { status: 500 })
    }

    const botMessage = data.choices?.[0]?.message?.content || "Je suis là pour toi. 🌿"

    return NextResponse.json({ response: botMessage })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json({ response: "Oups, une erreur s'est produite. 😔" }, { status: 500 })
  }
}
