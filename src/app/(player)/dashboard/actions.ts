'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function stopSession(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('game_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('player_id', user.id) // sécurité : uniquement ses propres sessions

  redirect('/dashboard')
}
