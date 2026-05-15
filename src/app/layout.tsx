import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crystarium',
  description: 'Your knowledge, crystallized.',
  icons: {
    icon: '/icons/android-chrome-128x128.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
