'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const examples = [
  '✍️ Write a blog post from my notes',
  '🎙️ Transcribe a voice recording',
  '🖼️ Remove background from a photo',
  '📊 Turn spreadsheet data into a chart',
  '📧 Write a cold email that gets replies',
]

export default function InputPage() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function submit(q: string) {
    if (!q.trim()) return
    router.push(`/results?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-indigo-400 text-sm font-semibold">Cancel</Link>
        <span className="text-white font-bold text-sm">Find Apps</span>
        <div className="w-12" />
      </div>
      <h1 className="text-white font-extrabold text-2xl mb-1">What are you<br />trying to do?</h1>
      <p className="text-gray-500 text-sm mb-5">Describe your problem in plain language</p>
      <textarea
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="e.g. I need to turn my voice notes into a structured blog post automatically"
        className="bg-gray-800 border border-indigo-500 text-white rounded-xl p-3 text-sm resize-none h-24 mb-4 outline-none placeholder-gray-600"
      />
      <button
        onClick={() => submit(query)}
        className="w-full bg-brand text-white font-bold text-sm py-3 rounded-xl mb-6"
      >
        Deliver Apps →
      </button>
      <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-3">Try these</p>
      <div className="flex flex-col gap-2">
        {examples.map(ex => (
          <button
            key={ex}
            onClick={() => submit(ex)}
            className="bg-gray-800 text-gray-400 rounded-xl px-4 py-2.5 text-sm text-left"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
