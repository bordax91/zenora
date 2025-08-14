"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/supabase/user-context"

export default function CreatePackagePage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/create-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          coachId: user.id,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erreur inconnue")

      setSuccess(true)
      router.push("/coach/packages")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Créer une nouvelle offre</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          type="text"
          placeholder="Titre de l'offre"
          className="w-full border p-2 rounded"
          required
          value={form.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border p-2 rounded"
          required
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="price"
          type="number"
          placeholder="Prix en €"
          className="w-full border p-2 rounded"
          required
          min="1"
          value={form.price}
          onChange={handleChange}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Chargement..." : "Créer l'offre"}
        </button>
      </form>
    </div>
  )
}
