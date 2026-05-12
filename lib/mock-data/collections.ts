import type { Collection } from '../types'

export const collections: Collection[] = [
  {
    id: 'solo-founder',
    title: 'Solo Founder Starter Pack',
    description: 'Everything you need to go from idea to launched product — without a team.',
    emoji: '🚀',
    appIds: ['launchkit', 'blogai', 'pixeldrop', 'resume-ai'],
    updatedDaysAgo: 2,
  },
  {
    id: 'content-creator',
    title: 'Content Creator Toolkit',
    description: 'Script, record, edit, and publish faster.',
    emoji: '✍️',
    appIds: ['blogai', 'voicenote-pro', 'pixeldrop'],
    updatedDaysAgo: 5,
  },
  {
    id: 'job-seeker',
    title: 'Job Seeker Kit',
    description: 'Stand out at every stage of the application process.',
    emoji: '💼',
    appIds: ['resume-ai', 'blogai'],
    updatedDaysAgo: 8,
  },
]
