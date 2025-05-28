import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// Import startup services for automatic initialization
import './startup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mastra Article Agent',
  description: 'AI-powered article research and analysis tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 