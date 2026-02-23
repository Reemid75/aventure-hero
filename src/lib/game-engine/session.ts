import { createClient } from '@/lib/supabase/server'
import type { StartSessionResult } from '@/types/game.types'

export async function startOrResumeSession(
  storyId: string,
  playerId: string
): Promise<StartSessionResult & { error?: string }> {
  const supabase = await createClient()

  // Chercher une session ACTIVE existante pour cette histoire
  const { data: existing } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('player_id', playerId)
    .eq('story_id', storyId)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return { sessionId: existing.id, isNew: false }
  }

  // Récupérer la scène de départ (avec ses keywords)
  const { data: startScene, error: sceneError } = await supabase
    .from('scenes')
    .select('id, keywords')
    .eq('story_id', storyId)
    .eq('is_start', true)
    .single()

  if (sceneError || !startScene) {
    return { sessionId: '', isNew: false, error: 'Aucune scène de départ trouvée' }
  }

  // Créer une nouvelle session (les sessions terminées sont conservées)
  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      player_id: playerId,
      story_id: storyId,
      current_scene_id: startScene.id,
      status: 'active',
      journal: startScene.keywords ?? [],
      items: [],
    })
    .select('id')
    .single()

  if (sessionError || !session) {
    return { sessionId: '', isNew: false, error: 'Erreur lors de la création de la session' }
  }

  // Enregistrer la visite initiale
  await supabase.from('scene_visits').insert({
    session_id: session.id,
    scene_id: startScene.id,
  })

  return { sessionId: session.id, isNew: true }
}
