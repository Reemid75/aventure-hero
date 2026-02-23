'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function collectItem(sessionId: string, item: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: session } = await supabase
    .from('game_sessions')
    .select('items')
    .eq('id', sessionId)
    .eq('player_id', user.id)
    .single()

  if (!session) return

  const currentItems: string[] = session.items ?? []
  if (currentItems.includes(item)) return

  await supabase
    .from('game_sessions')
    .update({ items: [...currentItems, item] })
    .eq('id', sessionId)
    .eq('player_id', user.id)

  revalidatePath(`/play/${sessionId}`)
}

export async function removeItem(sessionId: string, item: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: session } = await supabase
    .from('game_sessions')
    .select('items')
    .eq('id', sessionId)
    .eq('player_id', user.id)
    .single()

  if (!session) return

  await supabase
    .from('game_sessions')
    .update({ items: (session.items ?? []).filter((i: string) => i !== item) })
    .eq('id', sessionId)
    .eq('player_id', user.id)

  revalidatePath(`/play/${sessionId}`)
}
