'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function CoachDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSession, setEditingSession] = useState(null)
  const [noteCoach, setNoteCoach] = useState('')
  const [newDate, setNewDate] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [statut, setStatut] = useState('prévu')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      setUserId(user.id)

      const { data: sessionList, error } = await supabase
        .from('sessions')
        .select(`
          id,
          date,
          statut,
          note_coach,
          note_client,
          client:client_id (id, email)
        `)
        .eq('coach_id', user.id)
        .order('date', { ascending: true })

      if (error) console.error('Erreur chargement sessions:', error)
      else setSessions(sessionList || [])

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleEditClick = (session) => {
    setEditingSession(session)
    setNoteCoach(session.note_coach || '')
    setNewDate(session.date)
    setClientEmail(session.client?.email || '')
    setStatut(session.statut)
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setNoteCoach('')
    setNewDate('')
    setClientEmail('')
    setStatut('prévu')
  }

  const handleSaveChanges = async () => {
    if (!newDate || !clientEmail) return

    const { data: client, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', clientEmail)
      .single()

    if (lookupError || !client) {
      alert("Client introuvable avec cette adresse email")
      return
    }

    const clientId = client.id

    if (editingSession?.id) {
      const { error } = await supabase
        .from('sessions')
        .update({
          note_coach: noteCoach,
          date: newDate,
          client_id: clientId,
          statut: statut
        })
        .eq('id', editingSession.id)

      if (error) alert("Erreur lors de la mise à jour")
      else {
        alert("Modifications enregistrées")
        window.location.reload()
      }
    } else {
      const { error } = await supabase
        .from('sessions')
        .insert({
          coach_id: userId,
          client_id: clientId,
          date: newDate,
          statut: statut,
          note_coach: noteCoach
        })

      if (error) alert("Erreur lors de la création")
      else {
        alert("Session créée")
        window.location.reload()
      }
    }
  }

  const handleDeleteSession = async (id) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) alert('Erreur suppression session')
    else setSessions(sessions.filter((s) => s.id !== id))
  }

  const isPast = (dateStr) => new Date(dateStr) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Zenora Logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-800">Zenora</span>
        </Link>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/chat" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm text-center hover:bg-blue-700 transition">
            
