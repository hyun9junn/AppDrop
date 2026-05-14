import { render, screen } from '@testing-library/react'
import ReelViewer from '../ReelViewer'
import { apps } from '@/lib/mock-data/apps'
import { creators } from '@/lib/mock-data/creators'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'card.the_problem': 'The Problem',
      'card.the_solution': 'The Solution',
      'reel.try': 'Try',
      'reel.boost': '⬆ Boost',
      'reel.save_creator': '⭐ Save Creator',
      'reel.swipe_hint': 'Swipe up for next',
      'viewer.new_drop': 'New drop',
      'viewer.featured': 'Featured',
    }[key] ?? key),
    localizeApp: (a: (typeof apps)[0]) => a,
  }),
}))

jest.mock('@/hooks/useDeviceId', () => ({
  useDeviceId: () => 'test-device',
}))

jest.mock('@/lib/api', () => ({
  toggleBoost: jest.fn(),
  toggleFavorite: jest.fn(),
}))

const app = apps[0]

test('renders problem statement', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(screen.getByText(app.storyCard.problemStatement)).toBeInTheDocument()
})

test('renders solution statement', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(screen.getByText(app.storyCard.solutionStatement)).toBeInTheDocument()
})

test('renders app title', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(screen.getAllByText(app.title).length).toBeGreaterThan(0)
})

test('renders all features', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  app.storyCard.features.forEach(f => {
    expect(screen.getByText(f)).toBeInTheDocument()
  })
})

test('renders Try CTA link pointing to app.link', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  const links = screen.getAllByRole('link').filter(l => l.getAttribute('href') === app.link)
  expect(links.length).toBeGreaterThan(0)
})

test('renders video element when reelVideoUrl is set', () => {
  const appWithVideo = { ...app, reelVideoUrl: 'blob:http://localhost/fake-video' }
  render(<ReelViewer apps={[appWithVideo, ...apps.slice(1)]} creators={creators} initialAppId={app.id} />)
  const video = document.querySelector('video')
  expect(video).toBeInTheDocument()
  expect(video?.getAttribute('src')).toBe('blob:http://localhost/fake-video')
})

test('does not render video element when reelVideoUrl is absent', () => {
  render(<ReelViewer apps={apps} creators={creators} initialAppId={app.id} />)
  expect(document.querySelector('video')).not.toBeInTheDocument()
})
