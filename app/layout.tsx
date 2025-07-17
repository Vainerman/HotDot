import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

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
        <div className="h-screen-dynamic">{children}</div>
        <Script id="viewport-height-fix">
          {`
            function setViewportHeight() {
              let vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
            }
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
          `}
        </Script>
      </body>
    </html>
  )
}
