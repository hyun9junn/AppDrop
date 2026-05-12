import type { Creator } from '../types'

export const creators: Creator[] = [
  {
    id: 'kimdev',
    name: 'KimDev Studio',
    bio: 'AI tools for everyday problems. Based in Seoul.',
    avatar: 'K',
    links: ['https://kimdev.example.com'],
    appIds: ['resume-ai', 'pixeldrop'],
    regularCount: 142,
  },
  {
    id: 'novatech',
    name: 'NovaTech Labs',
    bio: 'Building AI-native productivity tools.',
    avatar: 'N',
    links: ['https://novatech.example.com'],
    appIds: ['voicenote-pro'],
    regularCount: 89,
  },
  {
    id: 'writesmart',
    name: 'WriteSmart',
    bio: 'AI writing tools for creators and marketers.',
    avatar: 'W',
    links: ['https://writesmart.example.com'],
    appIds: ['blogai'],
    regularCount: 203,
  },
  {
    id: 'shipfast',
    name: 'ShipFast',
    bio: 'Tools to ship products faster.',
    avatar: 'S',
    links: ['https://shipfast.example.com'],
    appIds: ['launchkit'],
    regularCount: 317,
  },
]
