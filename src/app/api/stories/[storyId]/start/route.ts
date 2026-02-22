import { createClient } from '@/lib/supabase/server'
import { startOrResumeSession } from '@/lib/game-engine/session'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Verify story exists and is published
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, is_published, author_id')
    .eq('id', storyId)
    .single()

  if (storyError || !story) {
    return NextResponse.json({ error: 'Histoire introuvable' }, { status: 404 })
  }

  if (!story.is_published && story.author_id !== user.id) {
    return NextResponse.json({ error: 'Histoire non disponible' }, { status: 403 })
  }

  const result = await startOrResumeSession(storyId, user.id)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ sessionId: result.sessionId, isNew: result.isNew })
}
