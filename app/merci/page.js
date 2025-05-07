'use client'

import Header from '@/components/Header'

export default function MerciPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Merci pour votre paiement ! 🎉</h1>
        <p className="text-gray-600 mb-10">Vous pouvez maintenant réserver votre séance de coaching.</p>
        
        {/* Calendly intégré ici */}
        <div className="w-full max-w-2xl h-[700px]">
          <iframe
            src="https://calendly.com/zenorasante"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            className="rounded-lg shadow-lg"
          ></iframe>
        </div>

      </main>
    </div>
  )
}
