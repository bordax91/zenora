import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      firstName = '',
      lastName = '',
      jobTitle = '',
      industry = '',
      location = '',
      recentActivity = '',
      painPoint = '',
      offer = '',
      platform = 'LinkedIn',
      role = 'coach',
    } = body

    const prompt = `
Tu es un expert en prospection digitale. Génère un message court, engageant et personnalisé pour entrer en contact avec une personne sur ${platform} en tant que ${role}.

🎯 Objectif : initier une discussion autour de ${offer} de manière naturelle, sans paraître commercial.

Voici les infos sur la cible :

- Nom : ${firstName} ${lastName}
- Métier : ${jobTitle}
- Secteur : ${industry}
- Lieu : ${location}
- Bio ou activité récente : ${recentActivity}
- Problème principal identifié : ${painPoint}
- Offre à proposer : ${offer}

Règles :
- Utilise un ton humain, amical et bienveillant.
- Reste concis (max 500 caractères).
- Pose une question ouverte à la fin pour inciter à la réponse.
- N’utilise aucun jargon.
- Ne parle pas de vente ou d'appel dès le premier message.

Génère 1 message parfaitement adapté à cette cible.
    `

    const response = await fetch('https://api.fireworks.ai/inference/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.FIREWORKS_MODEL || 'accounts/fireworks/models/deepseek-chat',
        prompt,
        max_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMsg =
        typeof data.error === 'string'
          ? data.error
          : JSON.stringify(data.error || 'Erreur Fireworks')
      console.error('Fireworks API Error:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    const message = data.choices?.[0]?.text?.trim()

    if (!message) {
      console.error('Fireworks API: Réponse vide')
      return NextResponse.json({ error: 'Réponse vide du modèle.' }, { status: 500 })
    }

    return NextResponse.json({ message })
  } catch (err) {
    console.error('Erreur API Prospection:', err)
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 })
  }
}
