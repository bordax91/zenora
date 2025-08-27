'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export default function EditCoachProfilePage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [bio, setBio] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/connectcoach')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('name, username, specialty, bio, photo_url')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setName(data.name || '')
        setUsername(data.username || '')
        setSpecialty(data.specialty || '')
        setBio(data.bio || '')
        setPhotoUrl(data.photo_url || null)
      }
    }

    fetchProfile()
  }, [router])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Utilisateur non connecté.")
      setLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      setError("Ce nom d'utilisateur est déjà pris.")
      setLoading(false)
      return
    }

    let newPhotoUrl = photoUrl

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fileName = `${user.id}_${uuidv4()}.${ext}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, photoFile, { upsert: true })

      if (uploadError) {
        setError("Erreur envoi photo.")
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      newPhotoUrl = urlData?.publicUrl || null
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        name,
        username,
        specialty,
        bio,
        photo_url: newPhotoUrl,
      })
      .eq('id', user.id)

    if (updateError) {
      setError("Erreur lors de l'enregistrement.")
      setLoading(false)
      return
    }

    router.push('/coach/settings')
  }

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">✏️ Modifier votre profil coach</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom complet</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Ex : Martin Dupont"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Nom d'utilisateur</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Ex : martinducoach"
          />
          <p className="text-sm text-gray-500 mt-1">
            Votre profil sera accessible via : <strong>zenoraapp.com/{username || 'votre-username'}</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">Spécialité</label>
          <input
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Ex : Coaching en confiance"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            rows={4}
            placeholder="Décrivez votre parcours, votre méthode, vos valeurs…"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Photo de profil (optionnelle)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
          {photoUrl && (
            <img
              src={photoUrl}
              alt="photo profil"
              className="h-20 w-20 mt-2 rounded-full object-cover"
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-4"
        >
          {loading ? 'Enregistrement...' : 'Mettre à jour'}
        </button>
      </div>
    </div>
  )
}
