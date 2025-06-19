'use client'

import { useEffect, useState } from 'react'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted')
    if (!accepted) setShowBanner(true)
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white px-6 py-4 text-sm z-50 flex flex-col sm:flex-row justify-between items-center shadow-lg">
      <p className="mb-2 sm:mb-0 sm:mr-4">
        Nous utilisons des cookies pour améliorer votre expérience.{" "}
        <a href="/politique-confidentialite" className="underline text-blue-300">En savoir plus</a>.
      </p>
      <button
        onClick={acceptCookies}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
      >
        J’accepte
      </button>
    </div>
  )
}
