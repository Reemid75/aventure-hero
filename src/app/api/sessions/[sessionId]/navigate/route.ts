import { createClient } from '@/lib/supabase/server'
import { navigate } from '@/lib/game-engine/navigate'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ choiceId: z.string().uuid() })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const result = await navigate(sessionId, parsed.data.choiceId, user.id)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    scene: result.scene,
    isEnding: result.isEnding,
    session: result.session,
  })
}
