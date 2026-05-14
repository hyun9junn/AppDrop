// app/submit/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import type { AccessType, Pricing } from '@/lib/types'
import { useLocale } from '@/lib/i18n'

const accessOptions: AccessType[] = ['web', 'api', 'download', 'extension']
const accessLabels: Record<AccessType, string> = {
  web: 'Web App', api: 'API', download: 'Download', extension: 'Extension',
}
const pricingOptions: Pricing[] = ['free', 'freemium', 'paid']

export default function SubmitPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [creatorName, setCreatorName] = useState('')
  const [link, setLink] = useState('')
  const [problem, setProblem] = useState('')
  const [audience, setAudience] = useState('')
  const [features, setFeatures] = useState('')
  const [access, setAccess] = useState<AccessType[]>([])
  const [pricing, setPricing] = useState<Pricing | ''>('')
  const [tags, setTags] = useState('')
  const [reelFile, setReelFile] = useState<File | null>(null)
  const [reelError, setReelError] = useState<string | null>(null)

  function toggleAccess(type: AccessType) {
    setAccess(prev => prev.includes(type) ? prev.filter(a => a !== type) : [...prev, type])
  }

  function handleReelFile(file: File | null) {
    setReelError(null)
    if (!file) { setReelFile(null); return }
    if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
      setReelError('Only MP4 or MOV files are accepted.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setReelError('File must be under 50MB.')
      return
    }
    setReelFile(file)
  }

  function handleSubmit() {
    if (!creatorName || !link || !problem || !audience || !features || access.length === 0 || !pricing) return
    const reelVideoUrl = reelFile ? URL.createObjectURL(reelFile) : undefined
    sessionStorage.setItem('submitForm', JSON.stringify({
      creatorName, link, problem, audience, features, access, pricing, tags, reelVideoUrl,
    }))
    router.push('/submit/generating')
  }

  return (
    <div className="pb-10 min-h-screen bg-gray-950">
      <TopBar title={t('submit.title')} />
      <div className="p-4 flex flex-col gap-5">
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">Your name or handle</label>
          <input value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="e.g. KimDev Studio" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q1')}</label>
          <input value={link} onChange={e => setLink(e.target.value)} placeholder={t('submit.q1_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q2')}</label>
          <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder={t('submit.q2_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q3')}</label>
          <input value={audience} onChange={e => setAudience(e.target.value)} placeholder={t('submit.q3_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q4')}</label>
          <textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder={t('submit.q4_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q5')}</label>
          <div className="flex flex-wrap gap-2">
            {accessOptions.map(opt => (
              <button key={opt} onClick={() => toggleAccess(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${access.includes(opt) ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                {accessLabels[opt]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q6')}</label>
          <div className="flex gap-2">
            {pricingOptions.map(opt => (
              <button key={opt} onClick={() => setPricing(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${pricing === opt ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">{t('submit.q7')}</label>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder={t('submit.q7_ph')} className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>

        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">
            {t('submit.reel_label')}
          </label>
          <p className="text-[10px] text-gray-500 mb-2">{t('submit.reel_hint')}</p>
          {reelFile ? (
            <div className="bg-gray-800 rounded-xl px-3 py-2.5 flex items-center justify-between">
              <p className="text-white text-xs">{t('submit.reel_selected')} {reelFile.name}</p>
              <button onClick={() => handleReelFile(null)} className="text-gray-400 text-xs ml-2">✕</button>
            </div>
          ) : (
            <label className="block w-full bg-gray-800 border border-dashed border-gray-600 rounded-xl px-3 py-5 text-center cursor-pointer hover:border-indigo-500 transition-colors">
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={e => handleReelFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-gray-400 text-xs">{t('submit.reel_accept')}</p>
            </label>
          )}
          {reelError && <p className="text-red-400 text-xs mt-1">{reelError}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full mt-3 bg-transparent text-gray-500 text-xs underline text-center"
          >
            {t('submit.reel_skip')}
          </button>
        </div>

        <button onClick={handleSubmit} className="w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl mt-2">
          {t('submit.cta')}
        </button>
      </div>
    </div>
  )
}
