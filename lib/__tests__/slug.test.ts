import { toSlug, generateId } from '../slug'

describe('toSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(toSlug('PDF Helper')).toBe('pdf-helper')
  })
  it('strips non-alphanumeric characters', () => {
    expect(toSlug('My App! (v2)')).toBe('my-app-v2')
  })
  it('collapses consecutive hyphens', () => {
    expect(toSlug('hello  world')).toBe('hello-world')
  })
})

describe('generateId', () => {
  it('starts with the slug of the input', () => {
    const id = generateId('PDF Helper')
    expect(id).toMatch(/^pdf-helper-[a-z0-9]{4}$/)
  })
  it('produces unique IDs for the same input', () => {
    const a = generateId('same')
    const b = generateId('same')
    expect(a).not.toBe(b)
  })
})
