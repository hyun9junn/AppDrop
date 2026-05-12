import { render, screen } from '@testing-library/react'
import CategoryGrid from '../CategoryGrid'

test('renders all 8 categories', () => {
  render(<CategoryGrid />)
  expect(screen.getByText('Writing')).toBeInTheDocument()
  expect(screen.getByText('Images')).toBeInTheDocument()
  expect(screen.getByText('Audio')).toBeInTheDocument()
  expect(screen.getByText('Video')).toBeInTheDocument()
  expect(screen.getByText('Data')).toBeInTheDocument()
  expect(screen.getByText('Business')).toBeInTheDocument()
  expect(screen.getByText('Design')).toBeInTheDocument()
  expect(screen.getByText('AI Tools')).toBeInTheDocument()
})

test('each category links to its browse page', () => {
  render(<CategoryGrid />)
  const writingLink = screen.getByRole('link', { name: /writing/i })
  expect(writingLink).toHaveAttribute('href', '/category/writing')
})
