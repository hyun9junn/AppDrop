'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import type { AccessType, Pricing } from '@/lib/types'

const accessOptions: AccessType[] = ['web', 'api', 'download', 'extension']
const accessLabels: Record<AccessType, string> = {
  web: 'Web App', api: 'API', download: 'Download', extension: 'Extension',
}
const pricingOptions: Pricing[] = ['free', 'freemium', 'paid']

export default function SubmitPage() {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [problem, setProblem] = useState('')
  const [audience, setAudience] = useState('')
  const [features, setFeatures] = useState('')
  const [access, setAccess] = useState<AccessType[]>([])
  const [pricing, setPricing] = useState<Pricing | ''>('')
  const [tags, setTags] = useState('')

  function toggleAccess(type: AccessType) {
    setAccess(prev => prev.includes(type) ? prev.filter(a => a !== type) : [...prev, type])
  }

  function handleSubmit() {
    if (!link || !problem || !audience || !features || access.length === 0 || !pricing) return
    router.push('/submit/generating')
  }

  return (
    <div className="pb-10 min-h-screen bg-gray-950">
      <TopBar title="Package Your App" />
      <div className="p-4 flex flex-col gap-5">
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">1. App Link</label>
          <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://your-app.com" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">2. What problem does your app solve?</label>
          <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="Describe the problem in 1–2 sentences" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">3. Who is it for?</label>
          <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who is it for? (e.g. freelancers, marketers)" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">4. What are the 3 core features?</label>
          <textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder="List 3 core features, comma-separated" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600 resize-none h-16" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">5. How do users access it?</label>
          <div className="flex flex-wrap gap-2">
            {accessOptions.map(opt => (
              <button
                key={opt}
                onClick={() => toggleAccess(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${access.includes(opt) ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
              >
                {accessLabels[opt]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">6. Pricing</label>
          <div className="flex gap-2">
            {pricingOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setPricing(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${pricing === opt ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1.5">7. Category Tags</label>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. writing, productivity, AI" className="w-full bg-gray-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-700 placeholder-gray-600" />
        </div>
        <button onClick={handleSubmit} className="w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl mt-2">
          Generate My App Package →
        </button>
      </div>
    </div>
  )
}
