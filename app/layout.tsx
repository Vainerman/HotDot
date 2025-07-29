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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#F4F1E9" />
      </head>
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
              const isMobileSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && 
                                   /Safari/.test(navigator.userAgent) && 
                                   !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
              
              if (isMobileSafari) {
                // Method 1: Force a more aggressive scroll
                const attemptHide = () => {
                  // Ensure page is scrollable
                  document.body.style.minHeight = '101vh';
                  
                  // Multiple scroll attempts
                  window.scrollTo(0, 1);
                  setTimeout(() => window.scrollTo(0, 2), 50);
                  setTimeout(() => window.scrollTo(0, 1), 100);
                  setTimeout(() => window.scrollTo(0, 0), 150);
                };
                
                // Try immediately
                attemptHide();
                
                // Try again after a delay
                setTimeout(attemptHide, 300);
                setTimeout(attemptHide, 1000);
                
                // Method 2: On first user interaction
                const hideOnTouch = () => {
                  window.scrollTo(0, 1);
                  setTimeout(() => window.scrollTo(0, 0), 50);
                  // Remove listener after first use
                  document.removeEventListener('touchstart', hideOnTouch);
                  document.removeEventListener('click', hideOnTouch);
                };
                
                document.addEventListener('touchstart', hideOnTouch, { passive: true });
                document.addEventListener('click', hideOnTouch, { passive: true });
                
                // Method 3: Use Visual Viewport API if available
                if (window.visualViewport) {
                  const handleViewportChange = () => {
                    if (window.visualViewport.height < window.innerHeight) {
                      // Address bar is probably visible, try to hide it
                      setTimeout(() => window.scrollTo(0, 1), 100);
                    }
                  };
                  
                  window.visualViewport.addEventListener('resize', handleViewportChange);
                }
              }
            }
            
            // Run on page load and when DOM is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', hideSafariAddressBar);
            } else {
              hideSafariAddressBar();
            }
            
            // Also try on window load
            window.addEventListener('load', hideSafariAddressBar);
          `}
        </Script>
      </body>
    </html>
  )
}
