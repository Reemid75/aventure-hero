import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EndingScreen } from '@/components/game/EndingScreen'
import type { Story } from '@/types/game.types'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function EndPage({ params }: Props) {
  const { sessionId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('game_sessions')
    .select('id, player_id, story_id, current_scene_id, status, journal, items, started_at, completed_at, updated_at')
    .eq('id', sessionId)
    .eq('player_id', user.id)
    .single()

  if (!session) notFound()
  if (session.status === 'active') redirect(`/play/${sessionId}`)

  const [{ data: story }, { data: scene }] = await Promise.all([
    supabase.from('stories').select('id, title, description, author_id, is_published, cover_image, created_at, updated_at').eq('id', session.story_id).single(),
    supabase.from('scenes').select('id, story_id, title, content, is_start, is_ending, ending_type, keywords, required_keywords, item_keywords, visual_url, position_x, position_y, created_at, updated_at').eq('id', session.current_scene_id).single(),
  ])

  if (!story || !scene) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <EndingScreen scene={scene} story={story as Story} session={session} />
    </div>
  )
}
