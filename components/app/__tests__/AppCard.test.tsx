import { render, screen } from '@testing-library/react'
import AppCard from '../AppCard'
import { apps } from '@/lib/mock-data/apps'

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
