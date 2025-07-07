import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import Providers from '@/components/auth/providers'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'HOTDOT',
  description: 'A drawing game of hot and cold.',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} font-sans`}>
      <body className="bg-[#F4F1E9]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
