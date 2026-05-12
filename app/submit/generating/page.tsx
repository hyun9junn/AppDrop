'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  'Reading your submission...',
  'Writing description + tagline',
  'Generating use cases',
  'Rendering Story card',
  'Writing social copy',
  'Creating embeddings',
]

export default function GeneratingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step < steps.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 700)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => router.push('/submit/preview'), 800)
      return () => clearTimeout(t)
    }
  }, [step, router])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/30">
        🤖
      </div>
      <h2 className="text-white font-extrabold text-xl mb-1">Packaging your app...</h2>
      <p className="text-gray-500 text-sm mb-8">AI is generating your full package</p>
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
      <p className="text-gray-600 text-xs mt-3">~15 seconds</p>
    </div>
  )
}
