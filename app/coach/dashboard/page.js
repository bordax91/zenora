'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function CoachDashboard() {
const \[sessions, setSessions] = useState(\[])
const \[loading, setLoading] = useState(true)
const \[clients, setClients] = useState(\[])
const \[clientId, setClientId] = useState('')
const \[date, setDate] = useState('')
const \[statut, setStatut] = useState('prévu')
const \[noteCoachEdit, setNoteCoachEdit] = useState({})
const \[userId, setUserId] = useState('')
const \[editingSessionId, setEditingSessionId] = useState(null)

useEffect(() => {
const fetchData = async () => {
const { data: authData } = await supabase.auth.getUser()
const user = authData?.user
if (!user) return

```
  setUserId(user.id)

  const { data: clientList } = await supabase
    .from('users')
    .select('id, email')
    .eq('role', 'client')

  setClients(clientList || [])

  const { data: sessionList, error } = await supabase
    .from('sessions')
    .select(`
      id,
      date,
      statut,
      note_coach,
      note_client,
      client:client_id (
        id,
        email
      )
    `)
    .eq('coach_id', user.id)
    .order('date', { ascending: true })

  if (error) console.error('Erreur chargement sessions:', error)
  setSessions(sessionList || [])
  setLoading(false)
}

fetchData()
```

}, \[])

const resetForm = () => {
setClientId('')
setDate('')
setStatut('prévu')
setEditingSessionId(null)
}

const handleCreateOrUpdateSession = async (e) => {
e.preventDefault()
if (!clientId || !date || !userId) return

```
if (editingSessionId) {
  const { error } = await supabase
    .from('sessions')
    .update({ client_id: clientId, date, statut })
    .eq('id', editingSessionId)

  if (error) {
    alert('Erreur modification session')
  } else {
    alert('Session modifiée !')
    window.location.reload()
  }
} else {
  const { error } = await supabase.from('sessions').insert({
    coach_id: userId,
    client_id: clientId,
    date,
    statut,
  })

  if (error) {
    alert('Erreur création session')
    console.error(error)
  } else {
    alert('Session créée !')
    window.location.reload()
  }
}
```

}

const handleEditSession = (session) => {
setEditingSessionId(session.id)
setClientId(session.client?.id || '')
setDate(session.date)
setStatut(session.statut)
}

const handleDeleteSession = async (id) => {
const { error } = await supabase.from('sessions').delete().eq('id', id)
if (error) {
alert('Erreur suppression session')
} else {
setSessions(sessions.filter((s) => s.id !== id))
}
}

const handleNoteCoachChange = (id, value) => {
setNoteCoachEdit((prev) => ({ ...prev, \[id]: value }))
}

const handleSaveNoteCoach = async (id) => {
const note = noteCoachEdit\[id]
const { error } = await supabase
.from('sessions')
.update({ note\_coach: note })
.eq('id', id)

```
if (error) {
  alert("Erreur lors de l'enregistrement de la note")
} else {
  alert('Note enregistrée')
  window.location.reload()
}
```

}

return ( <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4"> <header className="flex items-center justify-between mb-6"> <div className="flex items-center gap-3"> <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} /> <span className="text-xl font-bold text-gray-800">Zenora</span> </div> <div className="flex gap-3"> <Link
         href="/chat"
         className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
       >
🧠 Discuter avec notre IA </Link> <Link
         href="/"
         className="text-blue-600 px-4 py-2 text-sm hover:underline"
       >
Accueil </Link> </div> </header>

```
  <h1 className="text-2xl font-bold mb-4">Vos sessions</h1>

  <form onSubmit={handleCreateOrUpdateSession} className="mb-6 bg-white p-4 rounded-xl shadow space-y-4">
    <div>
      <label className="block text-sm mb-1">Client</label>
      <select
        className="w-full border px-3 py-2 rounded"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
      >
        <option value="">— Choisir un client —</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.email}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm mb-1">Date</label>
      <input
        type="datetime-local"
        className="w-full border px-3 py-2 rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>

    <div>
      <label className="block text-sm mb-1">Statut</label>
      <select
        className="w-full border px-3 py-2 rounded"
        value={statut}
        onChange={(e) => setStatut(e.target.value)}
      >
        <option value="prévu">prévu</option>
        <option value="terminé">terminé</option>
      </select>
    </div>

    <div className="flex gap-4">
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {editingSessionId ? 'Mettre à jour' : 'Créer la session'}
      </button>
      {editingSessionId && (
        <button
          type="button"
          className="text-sm text-gray-600 hover:underline"
          onClick={resetForm}
        >
          Annuler la modification
        </button>
      )}
    </div>
  </form>

  {loading ? (
    <p>Chargement...</p>
  ) : sessions.length === 0 ? (
    <p>Aucune session prévue.</p>
  ) : (
    <ul className="space-y-4">
      {sessions.map((session) => (
        <li key={session.id} className="bg-white p-4 rounded-xl shadow border">
          <p><strong>Date :</strong> {new Date(session.date).toLocaleString('fr-FR')}</p>
          <p><strong>Client :</strong> {session.client?.email || '—'}</p>
          <p><strong>Statut :</strong> {session.statut}</p>
          <p><strong>Note du client :</strong> {session.note_client || '—'}</p>

          <div className="mt-3">
            <label className="block text-sm mb-1">Note du coach :</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows={2}
              value={noteCoachEdit[session.id] ?? session.note_coach ?? ''}
              onChange={(e) => handleNoteCoachChange(session.id, e.target.value)}
            />
            <button
              onClick={() => handleSaveNoteCoach(session.id)}
              className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm"
            >
              Enregistrer
            </button>
          </div>

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleEditSession(session)}
              className="text-sm text-blue-600 hover:underline"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDeleteSession(session.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
```

)
}   

