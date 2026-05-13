import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubmitPage from '../page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

jest.mock('@/lib/i18n', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'submit.title': 'Drop Your App',
      'submit.q1': '1. App Link',
      'submit.q1_ph': 'https://your-app.com',
      'submit.q2': '2. Problem it solves',
      'submit.q2_ph': 'Describe the problem in 1–2 sentences',
      'submit.q3': '3. Target user',
      'submit.q3_ph': 'Who is it for? (e.g. freelancers, marketers)',
      'submit.q4': '4. Core features',
      'submit.q4_ph': 'List 3 core features, comma-separated',
      'submit.q5': '5. Access type',
      'submit.q6': '6. Pricing',
      'submit.q7': '7. Tags',
      'submit.q7_ph': 'e.g. writing, productivity, AI',
      'submit.cta': 'Generate My App Package →',
    }[key] ?? key),
  }),
}))

test('renders all form questions including creator name', () => {
  render(<SubmitPage />)
  expect(screen.getByPlaceholderText(/https:\/\//i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/problem/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/who is it for/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/3 core features/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/kimdev/i)).toBeInTheDocument()
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
