'use client'
import { apps } from '@/lib/mock-data/apps'
import TopBar from '@/components/layout/TopBar'
import StoryCard from '@/components/story/StoryCard'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'

export default function PreviewPage() {
  const { t, localizeApp } = useLocale()
  const app = localizeApp(apps[0])

  return (
    <div className="pb-10 bg-gray-50 min-h-screen">
      <TopBar
        backHref="/submit"
        title={t('preview.title')}
        rightAction={
          <Link href="/" className="text-brand text-sm font-bold">{t('preview.publish')}</Link>
        }
      />
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-gray-500 text-center">{t('preview.subtitle')}</p>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('preview.story_card')}</p>
          <StoryCard app={apps[0]} showActions={false} />
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('preview.twitter')}</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{app.socialCopy.twitter}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t('preview.linkedin')}</p>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{app.socialCopy.linkedin}</p>
          </div>
        </div>

        <Link href="/" className="block w-full bg-brand text-white font-extrabold text-sm py-4 rounded-2xl text-center mt-2">
          {t('preview.publish_cta')}
        </Link>
      </div>
    </div>
  )
}
