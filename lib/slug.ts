export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateId(text: string): string {
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${toSlug(text)}-${suffix}`
}
