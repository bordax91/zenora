import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const PHANTOMBUSTER_API_KEY = process.env.PHANTOMBUSTER_API_KEY
const PHANTOM_AGENT_ID = process.env.PHANTOM_AGENT_ID
const DAILY_LIMIT = 10

export async function POST(req) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 })
  }

  const coachId = user.id
  const { query } = await req.json()

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count, error: countError } = await supabase
    .from('search_logs')
    .select('*', { count: 'exact', head: true })
    .eq('coach_id', coachId)
    .gte('created_at', todayStart.toISOString())

  if (countError) {
    return NextResponse.json({ error: 'Erreur lors du comptage' }, { status: 500 })
  }

  if (count >= DAILY_LIMIT) {
    return NextResponse.json({ error: 'Limite quotidienne atteinte' }, { status: 429 })
  }

  try {
    // 🟢 Lancer le Phantom
    const launchRes = await fetch(`https://api.phantombuster.com/api/v2/agents/launch`, {
      method: 'POST',
      headers: {
        'X-Phantombuster-Key-1': PHANTOMBUSTER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: PHANTOM_AGENT_ID,
        argument: {
          search: query,
          numberOfProfiles: 10
        }
      })
    })

    const launchData = await launchRes.json()
    const containerId = launchData?.containerId
    if (!containerId) {
      return NextResponse.json({ error: 'Échec du lancement du Phantom' }, { status: 500 })
    }

    // ⏳ Attendre les résultats (20s)
    await new Promise(resolve => setTimeout(resolve, 20000))

    // 🟢 Récupérer les résultats
    const resultRes = await fetch(
      `https://api.phantombuster.com/api/v2/containers/fetch-output?id=${containerId}`,
      {
        headers: {
          'X-Phantombuster-Key-1': PHANTOMBUSTER_API_KEY
        }
      }
    )

    const resultData = await resultRes.json()
    const results = resultData?.output?.flatMap(item => item?.results || []) || []

    // ✅ Log dans Supabase
    await supabase.from('search_logs').insert([{ coach_id: coachId, query }])

    // ✂️ Format final
    const formatted = results.map(p => ({
      name: p.name,
      title: p.jobTitle,
      profileUrl: p.profileUrl
    }))

    return NextResponse.json({ results: formatted.slice(0, 10) })
  } catch (err) {
    console.error('Erreur Phantom:', err)
    return NextResponse.json({ error: 'Erreur lors de la récupération des résultats' }, { status: 500 })
  }
}
