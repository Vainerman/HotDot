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
        <div>{children}</div>
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
        <Script id="safari-address-bar-hide">
          {`
            function hideSafariAddressBar() {
              // Check if we're on mobile Safari
              if (/iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent)) {
                // Wait for page to load, then trigger a small scroll to hide address bar
                setTimeout(() => {
                  // Save current scroll position
                  const currentScroll = window.scrollY;
                  
                  // Scroll down 1px to trigger address bar hide
                  window.scrollTo(0, 1);
                  
                  // Restore original position after a brief delay
                  setTimeout(() => {
                    window.scrollTo(0, currentScroll);
                  }, 100);
                }, 500);
              }
            }
            
            // Run on page load
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', hideSafariAddressBar);
            } else {
              hideSafariAddressBar();
            }
          `}
        </Script>
      </body>
    </html>
  )
}
