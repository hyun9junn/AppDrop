import { render, screen, waitFor } from '@testing-library/react'
import ResultsPage from '../page'

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => 'resize images without photoshop' }),
}))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'results.heading': 'Apps for:',
      'collections.apps': 'apps',
      'home.see_all': 'See all',
    }[key] ?? key),
    localizeApp: (a: unknown) => a,
    localizeCollection: (c: unknown) => c,
    localizeFeedItem: (f: unknown) => f,
  }),
}))

jest.mock('@/lib/api', () => ({
  deliverApps: jest.fn().mockResolvedValue({
    apps: [{
      id: 'test-app-a1b2',
      title: 'Test App',
      tagline: 'A test app',
      link: 'https://test.com',
      creatorId: 'creator-x1y2',
      description: 'A test description',
      useCases: [],
      tags: [],
      category: 'writing',
      accessType: ['web'],
      pricing: 'free',
      storyCard: { problemStatement: '', solutionStatement: '', features: [] },
      socialCopy: { twitter: '', linkedin: '' },
      boostCount: 0,
      isNew: true,
      gradientTheme: 'indigo',
      targetUser: 'Test users',
      createdAt: new Date().toISOString(),
    }],
    collection: undefined,
  }),
}))

jest.mock('@/hooks/useDeviceId', () => ({
  useDeviceId: () => 'test-device-id',
}))

test('shows user query in heading', () => {
  render(<ResultsPage />)
  expect(screen.getByText(/resize images without photoshop/i)).toBeInTheDocument()
})

test('shows app cards after loading', async () => {
  render(<ResultsPage />)
  await waitFor(() => {
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })
})
