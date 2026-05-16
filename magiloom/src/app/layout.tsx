import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Magiloom — Your Second Brain, Crystallized',
  description: 'Clip any webpage, let AI understand it, and watch your knowledge crystallize into a connected graph. Magiloom is your intelligent second brain.',
  openGraph: {
    title: 'Magiloom — Your Second Brain, Crystallized',
    description: 'Clip any webpage, let AI understand it, and watch your knowledge crystallize into a connected graph.',
    siteName: 'Magiloom',
    type: 'website',
  },
  icons: {
    icon: '/icons/android-chrome-128x128.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
