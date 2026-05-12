import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubmitPage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

test('renders all 7 form questions', () => {
  render(<SubmitPage />)
  expect(screen.getByPlaceholderText(/https:\/\//i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/problem/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/who is it for/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/3 core features/i)).toBeInTheDocument()
})

test('submit button is present', () => {
  render(<SubmitPage />)
  expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
})

test('access type pills toggle on click', async () => {
  render(<SubmitPage />)
  const webPill = screen.getByText('Web App')
  expect(webPill).not.toHaveClass('bg-brand')
  await userEvent.click(webPill)
  expect(webPill).toHaveClass('bg-brand')
})
