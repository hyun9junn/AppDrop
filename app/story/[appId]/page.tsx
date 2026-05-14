import { redirect } from 'next/navigation'

export default async function StoryPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params
  redirect(`/reel/${appId}`)
}
