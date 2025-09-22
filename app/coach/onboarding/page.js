'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export default function CoachOnboardingPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [bio, setBio] = useState('')
  const [photoFile, setPhotoFile] = useState(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    // Vérification format username (regex identique à ta contrainte SQL)
    if (!/^[a-z0-9_-]+$/.test(username)) {
      setError("Le nom d'utilisateur doit contenir uniquement des minuscules, chiffres, tirets (-) ou underscores (_).")
      setLoading(false)
      return
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      setError("Utilisateur non connecté.")
      setLoading(false)
      return
    }

    // Vérification unicité du username
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle()

    if (checkError) {
      setError("Erreur lors de la vérification du nom d'utilisateur.")
      setLoading(false)
      return
    }

    if (existing) {
      setError("Ce nom d'utilisateur est déjà utilisé.")
      setLoading(false)
      return
    }

    // Upload image
    let photo_url = null
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${user.id}_${uuidv4()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        setError("Erreur lors de l'envoi de la photo.")
        setLoading(false)
        return
      }

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      photo_url = publicData.publicUrl
    }

    // Upsert des données dans la table "users"
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name,
        username,
        specialty,
        bio,
        photo_url,
        role: 'coach',
        email: user.email,
      }, { onConflict: 'id' })

    if (upsertError) {
      setError("Erreur lors de l'enregistrement du profil.")
      setLoading(false)
      return
    }

    router.push('/coach/welcome')
  }

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">🧑‍🏫 Créez votre profil</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Ex : Sarah Lefevre"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Nom d'utilisateur (public)</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} // force règles
            className="w-full border px-4 py-2 rounded"
            placeholder="Ex : sarahcoach"
          />
          <p className="text-sm text-gray-500 mt-1">
            ✅ Seulement lettres minuscules, chiffres, tirets (-) et underscores (_).  
            ❌ Pas d'espaces ni majuscules.  
            Votre profil sera accessible via : <strong>zenoraapp.com/votre-username</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Spécialité</label>
          <input
            type="text"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            placeholder="Ex : Coach en confiance en soi"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            rows={4}
            placeholder="Décrivez votre parcours, votre approche, vos valeurs..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Photo de profil (optionnelle)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-4"
        >
          {loading ? 'Enregistrement...' : 'Valider mon profil'}
        </button>
      </div>
    </div>
  )
}
