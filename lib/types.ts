export type Category =
  | 'writing' | 'images' | 'audio' | 'video'
  | 'data' | 'business' | 'design' | 'ai-tools'

export type AccessType = 'web' | 'api' | 'download' | 'extension'
export type Pricing = 'free' | 'freemium' | 'paid'
export type FeedItemType = 'drop' | 'beta' | 'announcement' | 'update'

export type GradientTheme =
  | 'indigo-purple' | 'sky-indigo' | 'emerald-sky'
  | 'amber-red' | 'blue-teal' | 'orange-amber'
  | 'purple-pink' | 'teal-cyan'

export const gradientMap: Record<GradientTheme, string> = {
  'indigo-purple': 'from-indigo-500 to-purple-600',
  'sky-indigo': 'from-sky-400 to-indigo-500',
  'emerald-sky': 'from-emerald-400 to-sky-500',
  'amber-red': 'from-amber-400 to-red-500',
  'blue-teal': 'from-blue-500 to-teal-400',
  'orange-amber': 'from-orange-400 to-amber-500',
  'purple-pink': 'from-purple-500 to-pink-500',
  'teal-cyan': 'from-teal-400 to-cyan-500',
}

export interface StoryCard {
  problemStatement: string
  solutionStatement: string
  features: string[]
  gradientTheme: GradientTheme
  shareableUrl: string
}

export interface App {
  id: string
  title: string
  tagline: string
  link: string
  creatorId: string
  description: string
  useCases: string[]
  tags: string[]
  category: Category
  accessType: AccessType[]
  pricing: Pricing
  storyCard: StoryCard
  socialCopy: { twitter: string; linkedin: string }
  boostCount: number
  isNew: boolean
}

export interface Creator {
  id: string
  name: string
  bio: string
  avatar: string
  links: string[]
  appIds: string[]
  regularCount: number
}

export interface Collection {
  id: string
  title: string
  description: string
  emoji: string
  appIds: string[]
  updatedDaysAgo: number
}

export interface FeedItem {
  id: string
  creatorId: string
  type: FeedItemType
  appId: string
  body: string
  hoursAgo: number
}
