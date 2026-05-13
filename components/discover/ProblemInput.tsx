'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

export default function ProblemInput() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { t } = useLocale()

  const examples = [
    t('input.examples.0'),
    t('input.examples.1'),
    t('input.examples.2'),
    t('input.examples.3'),
  ]

  function handleSubmit(q: string) {
    if (!q.trim()) return
    router.push(`/results?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 mx-4 mt-3">
      <p className="text-white font-extrabold text-sm mb-1">{t('input.heading')}</p>
      <p className="text-white/70 text-[10px] mb-3">{t('input.subtext')}</p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit(query)}
          placeholder={t('input.placeholder')}
          className="flex-1 bg-white/20 text-white placeholder-white/50 rounded-xl px-3 py-2 text-xs outline-none"
        />
        <button
          onClick={() => handleSubmit(query)}
          className="bg-white text-brand font-bold text-xs px-3 py-2 rounded-xl"
        >
          →
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {examples.map(ex => (
          <button
            key={ex}
            onClick={() => handleSubmit(ex)}
            className="bg-white/15 text-white/80 text-[9px] px-2 py-1 rounded-full"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
