import React from "react"
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/boty/cart-context'
import './globals.css'

const poppins = Poppins({
  subsets: ["latin"],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const lakesight = localFont({
  src: './fonts/Lakesight.ttf',
  variable: '--font-lakesight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Acid Blue — Cosas lindas, buena vibra',
  description: 'Almohadones, bolsos y accesorios con personalidad. DTF & Sublimación desde Córdoba Capital.',
  generator: 'v0.app',
  keywords: ['almohadones', 'bolsos', 'accesorios', 'DTF', 'sublimacion', 'arte impreso', 'kpop', 'Córdoba', 'Argentina', 'Acid Blue'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark bg-background">
      <body className={`${poppins.variable} ${lakesight.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
