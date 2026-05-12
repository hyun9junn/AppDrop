import { apps } from '../mock-data/apps'
import { creators } from '../mock-data/creators'
import { collections } from '../mock-data/collections'
import { feedItems } from '../mock-data/feed-items'

test('apps have required fields', () => {
  expect(apps.length).toBeGreaterThan(0)
  apps.forEach(app => {
    expect(app.id).toBeTruthy()
    expect(app.title).toBeTruthy()
    expect(app.storyCard.problemStatement).toBeTruthy()
    expect(app.storyCard.solutionStatement).toBeTruthy()
    expect(app.category).toBeTruthy()
  })
})

test('every app references a valid creator', () => {
  const creatorIds = new Set(creators.map(c => c.id))
  apps.forEach(app => expect(creatorIds.has(app.creatorId)).toBe(true))
})

test('every collection references valid apps', () => {
  const appIds = new Set(apps.map(a => a.id))
  collections.forEach(col =>
    col.appIds.forEach(id => expect(appIds.has(id)).toBe(true))
  )
})
