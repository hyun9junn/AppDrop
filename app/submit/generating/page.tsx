'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n'

export default function GeneratingPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [step, setStep] = useState(0)

  const steps = [
    t('generating.step.0'),
    t('generating.step.1'),
    t('generating.step.2'),
  ]

  useEffect(() => {
    if (step < steps.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 600)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => router.push('/submit/preview'), 500)
      return () => clearTimeout(timer)
    }
  }, [step, router, steps.length])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/30">
        🤖
      </div>
      <h2 className="text-white font-extrabold text-xl mb-1">{t('generating.title')}</h2>
      <p className="text-gray-500 text-sm mb-8">{t('generating.subtitle')}</p>
      <div className="w-full max-w-xs flex flex-col gap-3 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all ${i < step ? 'bg-brand text-white' : i === step ? 'bg-indigo-900 border-2 border-brand' : 'border border-gray-700'}`}>
              {i < step ? '✓' : ''}
            </div>
            <span className={`text-sm ${i <= step ? 'text-white' : 'text-gray-600'}`}>{s}</span>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xs h-1 bg-gray-800 rounded-full">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
