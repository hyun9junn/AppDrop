import Link from 'next/link'
import type { App } from '@/lib/types'
import { creators } from '@/lib/mock-data/creators'

interface StoryRingProps {
  app: App
  seen?: boolean
}

export default function StoryRing({ app, seen = false }: StoryRingProps) {
  const creator = creators.find(c => c.id === app.creatorId)
  const accent = app.accent ?? '#FF5A2C'
  const tint = creator?.tint ?? accent

  const ring = seen
    ? 'var(--line-2)'
    : `conic-gradient(from 220deg, ${accent}, ${tint}, ${accent})`

  return (
    <Link href={`/reel/${app.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64, textDecoration: 'none' }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%', padding: 2.5,
        background: ring,
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', padding: 2.5 }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: tint, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 22,
          }}>
            {creator?.avatar ?? app.title[0]}
          </div>
        </div>
      </div>
      <span style={{ fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 500, maxWidth: 70, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {creator?.name.split(' ')[0] ?? app.title}
      </span>
    </Link>
  )
}
