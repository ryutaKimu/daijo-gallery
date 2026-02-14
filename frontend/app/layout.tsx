import type { Metadata } from 'next'
import { Noto_Serif_JP } from 'next/font/google'

import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const notoSerif = Noto_Serif_JP({
  variable: '--font-noto-serif',
  subsets: ['latin'],
  display: 'optional',
  preload: true,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: '山田個展',
  description: '70歳画家 山田大乗による芸術作品集',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerif.variable} antialiased`}>
        <div className="absolute top-0 left-0 w-full z-20">
          <Header />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  )
}
