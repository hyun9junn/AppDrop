import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import MobileShell from '@/components/layout/MobileShell'
import BottomTabBar from '@/components/layout/BottomTabBar'
import { LocaleProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'] })
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'AppDrop',
  description: 'AI 시대의 앱 패키징 & 배포 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} ${instrumentSerif.variable}`}>
        <LocaleProvider>
          <MobileShell>
            {children}
            <BottomTabBar />
          </MobileShell>
        </LocaleProvider>
      </body>
    </html>
  )
}
