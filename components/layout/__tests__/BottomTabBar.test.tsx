import { render, screen } from '@testing-library/react'
import BottomTabBar from '../BottomTabBar'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale: () => {},
    t: (key: string) => ({
      'nav.discover': 'Discover',
      'nav.collections': 'Collections',
      'nav.feed': 'My Feed',
      'nav.profile': 'Profile',
    }[key] ?? key),
  }),
}))

test('renders all four tabs', () => {
  render(<BottomTabBar />)
  expect(screen.getByText('Discover')).toBeInTheDocument()
  expect(screen.getByText('Collections')).toBeInTheDocument()
  expect(screen.getByText('My Feed')).toBeInTheDocument()
  expect(screen.getByText('Profile')).toBeInTheDocument()
})

test('highlights Discover tab when on home route', () => {
  render(<BottomTabBar />)
  const discoverLabel = screen.getByText('Discover')
  expect(discoverLabel).toHaveClass('text-brand')
})
