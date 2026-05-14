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
      'nav.reels': 'Reels',
      'nav.feed': 'My Feed',
      'nav.profile': 'Profile',
    }[key] ?? key),
  }),
}))

test('renders all five tabs', () => {
  render(<BottomTabBar />)
  expect(screen.getByText('Discover')).toBeInTheDocument()
  expect(screen.getByText('Collections')).toBeInTheDocument()
  expect(screen.getByText('Reels')).toBeInTheDocument()
  expect(screen.getByText('My Feed')).toBeInTheDocument()
  expect(screen.getByText('Profile')).toBeInTheDocument()
})

test('highlights Discover tab when on home route', () => {
  render(<BottomTabBar />)
  expect(screen.getByText('Discover')).toHaveClass('text-brand')
})

test('Reels tab links to /reels', () => {
  render(<BottomTabBar />)
  const reelsLink = screen.getByText('Reels').closest('a')
  expect(reelsLink).toHaveAttribute('href', '/reels')
})
