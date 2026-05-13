import { render, screen } from '@testing-library/react'
import FeedItem from '../FeedItem'
import { feedItems } from '@/lib/mock-data/feed-items'
import { creators } from '@/lib/mock-data/creators'
import { apps } from '@/lib/mock-data/apps'

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'badge.drop': '🆕 New Drop',
      'badge.beta': '🧪 Beta',
      'badge.announcement': '📢 Announcement',
      'badge.update': '🔄 Update',
      'badge.cta.drop': 'View App →',
      'badge.cta.beta': 'Join Beta →',
      'badge.cta.announcement': 'Read More →',
      'badge.cta.update': "See What's New →",
    }[key] ?? key),
    localizeApp: (a: unknown) => a,
    localizeFeedItem: (f: unknown) => f,
  }),
}))

const item = feedItems[0]
const creator = creators.find(c => c.id === item.creatorId)!
const app = apps.find(a => a.id === item.appId)!

test('renders creator name', () => {
  render(<FeedItem item={item} creator={creator} app={app} />)
  expect(screen.getByText(creator.name)).toBeInTheDocument()
})

test('renders app title', () => {
  render(<FeedItem item={item} creator={creator} app={app} />)
  expect(screen.getByText(app.title)).toBeInTheDocument()
})

test('renders New Drop badge for drop type', () => {
  render(<FeedItem item={item} creator={creator} app={app} />)
  expect(screen.getByText(/New Drop/i)).toBeInTheDocument()
})
