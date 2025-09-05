import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function ProspectionHistoryPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return <p className="text-center mt-10 text-red-500">Erreur d’authentification.</p>
  }

  const { data: messages, error } = await supabase
    .from('prospection_messages') // ou 'prospection_logs' si tu as renommé la table
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="text-center mt-10 text-red-500">Erreur lors du chargement de l’historique.</p>
  }

  if (!messages || messages.length === 0) {
    return <p className="text-center mt-10 text-gray-500">Aucun message généré pour l’instant.</p>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">📜 Historique de Prospection</h1>

      <ul className="space-y-6">
        {messages.map((msg) => (
          <li key={msg.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-1">
              🎯 Cible : {msg.first_name} {msg.last_name} ({msg.job_title}, {msg.industry})
            </p>
            <p className="text-gray-800 whitespace-pre-wrap">{msg.generated_message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
