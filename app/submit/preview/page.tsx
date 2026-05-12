import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import StoryCard from '@/components/story/StoryCard'
import Link from 'next/link'

export default function PreviewPage() {
  const app = apps[0]

  return (
    <div className="pb-10 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/submit"
        title="Your App Package"
        rightAction={
          <Link href="/" className="text-brand text-sm font-bold">Publish</Link>
        }
      />
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-gray-500 text-center">Review your package before publishing</p>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Story Card</p>
          <StoryCard app={app} showActions={false} />
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Twitter/X Copy</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed">{app.socialCopy.twitter}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">LinkedIn Copy</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed">{app.socialCopy.linkedin}</p>
          </div>
        </div>

        <Link href="/" className="block w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl text-center mt-2">
          Publish App →
        </Link>
      </div>
    </div>
  )
}
