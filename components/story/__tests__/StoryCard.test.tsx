import { render, screen } from '@testing-library/react'
import StoryCard from '../StoryCard'
import { apps } from '@/lib/mock-data/apps'

const app = apps[0] // ResumeAI

test('renders problem statement', () => {
  render(<StoryCard app={app} />)
  expect(screen.getByText(app.storyCard.problemStatement)).toBeInTheDocument()
})

test('renders solution statement', () => {
  render(<StoryCard app={app} />)
  expect(screen.getByText(app.storyCard.solutionStatement)).toBeInTheDocument()
})

test('renders all feature checkmarks', () => {
  render(<StoryCard app={app} />)
  app.storyCard.features.forEach(f => {
    expect(screen.getByText(f)).toBeInTheDocument()
  })
})

test('renders Try CTA with app title', () => {
  render(<StoryCard app={app} />)
  expect(screen.getByRole('link', { name: /Try ResumeAI/i })).toBeInTheDocument()
})
