import './globals.css'

export const metadata = {
  title: 'Coach IA Bienveillant',
  description: 'Discute librement avec une IA empathique',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
