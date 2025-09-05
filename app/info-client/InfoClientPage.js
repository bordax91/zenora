'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function InfoClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')
  const availabilityId = searchParams.get('availabilityId')

  const [mode, setMode] = useState('signup') // ✅ affichage par défaut : formulaire de création
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result

      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              first_name: form.first_name,
              last_name: form.last_name
            }
          }
        })
      } else {
        result = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        })
      }

      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      const clientId = userData?.user?.id

      if (!clientId) {
        setError("Erreur d'identification du client.")
        setLoading(false)
        return
      }

      // 🔄 Insertion dans table "users" si nouveau client
      if (mode === 'signup') {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', clientId)
          .maybeSingle()

        if (!existingUser) {
          const { error: insertError } = await supabase.from('users').insert([
            {
              id: clientId,
              email: form.email,
              name: `${form.first_name} ${form.last_name}`,
              role: 'client'
            }
          ])

          if (insertError) {
            console.error('❌ Erreur insertion user :', insertError)
            setError("Erreur lors de l'ajout de l'utilisateur.")
            setLoading(false)
            return
          }
        }
      }

      // 🧾 Création de la session Stripe
      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          availabilityId,
          clientId
        })
      })

      const data = await response.json()

      if (!response.ok || !data?.url) {
        setError(data.error || 'Erreur lors de la redirection vers Stripe.')
        setLoading(false)
        return
      }

      window.location.href = data.url

    } catch (err) {
      console.error('❌ Erreur inconnue :', err)
      setError('Une erreur est survenue.')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">
        {mode === 'signup' ? 'Créer un compte' : 'Connexion'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <input
              type="text"
              name="first_name"
              placeholder="Prénom"
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Nom"
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Chargement...' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
          className="text-blue-600 underline text-sm"
        >
          {mode === 'signup'
            ? 'Déjà inscrit ? Se connecter'
            : "Pas encore de compte ? S'inscrire"}
        </button>
      </div>
    </div>
  )
}
