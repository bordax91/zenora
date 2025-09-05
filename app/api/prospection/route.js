import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 })
    }

    const coachId = user.id
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
      customMessage = ''
    } = body

    const additional = customMessage
      ? `\n\n📝 À inclure également : ${customMessage}`
      : ''

    const userMessage = `
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
${additional}

Règles :
- Utilise un ton humain, amical et bienveillant.
- Reste concis (max 500 caractères).
- Pose une question ouverte à la fin pour inciter à la réponse.
- N’utilise aucun jargon.
- Ne parle pas de vente ou d'appel dès le premier message.

Génère 1 message parfaitement adapté à cette cible.
    `.trim()

    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'accounts/fireworks/models/deepseek-v3p1',
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 600,
        temperature: 0.6,
        top_p: 1,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 0
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Fireworks API error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Erreur Fireworks' },
        { status: 500 }
      )
    }

    const message = data.choices?.[0]?.message?.content?.trim()

    if (!message) {
      return NextResponse.json(
        { error: 'Réponse vide du modèle.' },
        { status: 500 }
      )
    }

    // ✅ Insertion dans Supabase
    const { error: insertError } = await supabase.from('prospection_logs').insert([
      {
        coach_id: coachId,
        first_name: firstName || null,
        last_name: lastName || null,
        job_title: jobTitle || null,
        industry: industry || null,
        location: location || null,
        recent_activity: recentActivity || null,
        pain_point: painPoint || null,
        offer: offer || null,
        platform: platform || null,
        role: role || null,
        custom_message: customMessage || null,
        generated_message: message
      }
    ])

    if (insertError) {
      console.error('Erreur insertion Supabase:', insertError)
    }

    return NextResponse.json({
      message,
      saved: !insertError
    })
  } catch (err) {
    console.error('Erreur API Prospection:', err)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
