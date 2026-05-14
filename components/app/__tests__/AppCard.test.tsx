import { render, screen } from '@testing-library/react'
import AppCard from '../AppCard'
import { apps } from '@/lib/mock-data/apps'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'app.try': 'Try →',
      'app.boost': '⬆ Boost',
      'reel.watch': 'Watch Reel →',
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

test('renders app title', () => {
  render(<AppCard app={app} />)
  expect(screen.getByText(app.title)).toBeInTheDocument()
})

test('renders boost count', () => {
  render(<AppCard app={app} />)
  expect(screen.getByText(`⬆ ${app.boostCount}`)).toBeInTheDocument()
})

test('renders Try button linking to app', () => {
  render(<AppCard app={app} />)
  const link = screen.getByRole('link', { name: /try/i })
  expect(link).toHaveAttribute('href', app.link)
})

test('renders Watch Reel link pointing to /reel/<id>', () => {
  render(<AppCard app={app} />)
  const link = screen.getByRole('link', { name: /watch reel/i })
  expect(link).toHaveAttribute('href', `/reel/${app.id}`)
})
