import React from "react"
import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, Geist } from 'next/font/google'

import './globals.css'

const _pixelFont = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel' })
const _geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Potato Runner - Dodge the Knives!',
  description: 'A fun endless runner game where a potato dodges knives. Click to jump!',
}

export const viewport: Viewport = {
  themeColor: '#c4913a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_pixelFont.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
