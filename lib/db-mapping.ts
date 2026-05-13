import type { App, Creator, Collection, FeedItem, Category, AccessType, Pricing, GradientTheme, FeedItemType } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export function dbRowToApp(row: Row): App {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    link: row.link,
    creatorId: row.creator_id,
    description: row.description,
    useCases: row.use_cases,
    tags: row.tags,
    category: row.category as Category,
    accessType: row.access_type as AccessType[],
    pricing: row.pricing as Pricing,
    storyCard: {
      problemStatement: row.story_card.problemStatement,
      solutionStatement: row.story_card.solutionStatement,
      features: row.story_card.features,
      gradientTheme: row.story_card.gradientTheme as GradientTheme,
      shareableUrl: row.story_card.shareableUrl,
    },
    socialCopy: row.social_copy,
    boostCount: row.boost_count,
    isNew: row.is_new,
  }
}

export function dbRowToCreator(row: Row): Creator {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio,
    avatar: row.avatar,
    links: row.links,
    appIds: row.app_ids ?? [],
    regularCount: row.regular_count,
  }
}

export function dbRowToCollection(row: Row): Collection {
  const updatedAt = new Date(row.updated_at)
  const updatedDaysAgo = Math.floor(
    (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    appIds: row.app_ids,
    updatedDaysAgo,
  }
}

export function dbRowToFeedItem(row: Row): FeedItem {
  const createdAt = new Date(row.created_at)
  const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
  return {
    id: row.id,
    creatorId: row.creator_id,
    type: row.type as FeedItemType,
    appId: row.app_id,
    body: row.body,
    hoursAgo,
  }
}
