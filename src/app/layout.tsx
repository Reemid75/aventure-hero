import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Aventure — Dont vous êtes le héros',
  description: 'Jeu d\'aventures interactif à embranchements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
