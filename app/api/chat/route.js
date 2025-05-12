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
          { role: 'system', content: "Tu es Zenora, une IA de soutien émotionnel basé sur la santé mentale. Imagine être psychologue et suivre une personne souffrant d'un problème lié à la santé mentale(anxiété, stress, solitude, besoin d'écoute, ...) et ayant besoin de soutiens humains, émotionnels et pratiques en utilisant le tutoiement. Tu simules une conversation avec l'utilisateur afin de trouver une solution à ses problèmes.Il ne faut pas faire des réponses trop longue. Tu continues la conversation tant que l'utilisateur ne te demande pas d'arrêter." },
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
