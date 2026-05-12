import { render, screen } from '@testing-library/react'
import ResultsPage from '../page'

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => 'resize images without photoshop' }),
}))

test('shows user query in heading', () => {
  render(<ResultsPage />)
  expect(screen.getByText(/resize images without photoshop/i)).toBeInTheDocument()
})

test('shows at least one app card', () => {
  render(<ResultsPage />)
  const tryButtons = screen.getAllByRole('link', { name: /try/i })
  expect(tryButtons.length).toBeGreaterThan(0)
})
