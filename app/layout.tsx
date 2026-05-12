import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MobileShell from '@/components/layout/MobileShell'
import BottomTabBar from '@/components/layout/BottomTabBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AppDrop',
  description: 'AI-era app packaging and delivery platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <MobileShell>
          {children}
          <BottomTabBar />
        </MobileShell>
      </body>
    </html>
  )
}
