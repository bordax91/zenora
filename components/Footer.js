export default function Footer() {
  return (
    <footer className="mt-16 py-6 border-t text-center text-sm text-gray-500">
      <p>Zenora © 2025 — Tous droits réservés</p>
      <div className="flex justify-center gap-6 mt-2 flex-wrap">
        <a href="/mentions-legales" className="hover:underline text-blue-600">Mentions légales</a>
        <a href="/politique-confidentialite" className="hover:underline text-blue-600">Politique de confidentialité</a>
        <a href="/contact" className="hover:underline text-blue-600">Contact</a>
      </div>
    </footer>
  )
}
