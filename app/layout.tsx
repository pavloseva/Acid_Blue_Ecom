import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/boty/cart-context'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Acid Blue — Almohadones y arte impreso',
  description: 'Almohadones, posters y tazas con arte impreso. Envíos a todo el país desde Córdoba Capital. Stay.',
  generator: 'v0.app',
  keywords: ['almohadones', 'posters', 'tazas', 'arte impreso', 'kpop', 'Córdoba', 'Argentina', 'Acid Blue'],
}

export const viewport: Viewport = {
  themeColor: '#090b10',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark bg-background">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
