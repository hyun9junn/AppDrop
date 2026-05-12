import { render, screen } from '@testing-library/react'
import BottomTabBar from '../BottomTabBar'

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
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
