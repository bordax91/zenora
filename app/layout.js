import './globals.css'

export const metadata = {
  title: 'Coach IA Bienveillant',
  description: 'Discute librement avec une IA empathique',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
