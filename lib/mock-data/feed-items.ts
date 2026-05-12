import type { FeedItem } from '../types'

export const feedItems: FeedItem[] = [
  {
    id: 'fi-1',
    creatorId: 'kimdev',
    type: 'drop',
    appId: 'resume-ai',
    body: 'Tailor your CV to any job description in 60 seconds. Early users get lifetime free access.',
    hoursAgo: 2,
  },
  {
    id: 'fi-2',
    creatorId: 'novatech',
    type: 'beta',
    appId: 'voicenote-pro',
    body: 'Looking for early testers! VoiceNote Pro now supports 30+ languages. Join the beta.',
    hoursAgo: 26,
  },
  {
    id: 'fi-3',
    creatorId: 'shipfast',
    type: 'update',
    appId: 'launchkit',
    body: 'LaunchKit v2 shipped — Notion integration and faster export now live.',
    hoursAgo: 72,
  },
]
