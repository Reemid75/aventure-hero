import { createClient } from '@/lib/supabase/server'
import type { NavigateResult, SceneWithChoices, GameSession } from '@/types/game.types'

export async function navigate(
  sessionId: string,
  choiceId: string,
  playerId: string
): Promise<NavigateResult & { error?: string }> {
  const supabase = await createClient()

  // Charger la session et vérifier l'ownership
  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .select('id, player_id, story_id, current_scene_id, status, journal, started_at, completed_at, updated_at')
    .eq('id', sessionId)
    .eq('player_id', playerId)
    .eq('status', 'active')
    .single()

  if (sessionError || !session) {
    return { session: null as never, scene: null as never, isEnding: false, error: 'Session introuvable ou inactive' }
  }

  // Valider que le choix part bien de la scène courante
  const { data: choice, error: choiceError } = await supabase
    .from('choices')
    .select('id, story_id, from_scene_id, to_scene_id, label, order_index, created_at')
    .eq('id', choiceId)
    .eq('from_scene_id', session.current_scene_id)
    .single()

  if (choiceError || !choice) {
    return { session: null as never, scene: null as never, isEnding: false, error: 'Choix invalide' }
  }

  // Charger la scène de destination
  const { data: nextScene, error: nextSceneError } = await supabase
    .from('scenes')
    .select('id, is_ending, keywords, required_keywords')
    .eq('id', choice.to_scene_id)
    .single()

  if (nextSceneError || !nextScene) {
    return { session: null as never, scene: null as never, isEnding: false, error: 'Scène de destination introuvable' }
  }

  // Vérifier que le joueur possède tous les mots-clés requis
  const journal: string[] = session.journal ?? []
  const missing = (nextScene.required_keywords ?? []).filter((kw) => !journal.includes(kw))
  if (missing.length > 0) {
    return {
      session: null as never,
      scene: null as never,
      isEnding: false,
      error: `Mots-clés manquants dans le journal : ${missing.join(', ')}`,
    }
  }

  // Calculer le nouveau journal (union sans doublons)
  const newJournal = [...new Set([...journal, ...(nextScene.keywords ?? [])])]

  const isEnding = nextScene.is_ending

  // Mettre à jour la session
  const { data: updatedSession, error: updateError } = await supabase
    .from('game_sessions')
    .update({
      current_scene_id: nextScene.id,
      status: isEnding ? 'completed' : 'active',
      journal: newJournal,
      completed_at: isEnding ? new Date().toISOString() : null,
    })
    .eq('id', sessionId)
    .select('id, player_id, story_id, current_scene_id, status, journal, started_at, completed_at, updated_at')
    .single()

  if (updateError || !updatedSession) {
    return { session: null as never, scene: null as never, isEnding: false, error: 'Erreur lors de la mise à jour de la session' }
  }

  // Enregistrer la visite
  await supabase.from('scene_visits').insert({
    session_id: sessionId,
    scene_id: nextScene.id,
    choice_id: choiceId,
  })

  // Charger la scène complète avec ses choix
  const { data: sceneWithChoices } = await supabase
    .from('scenes')
    .select('id, story_id, title, content, is_start, is_ending, ending_type, keywords, required_keywords, position_x, position_y, created_at, updated_at, choices(*)')
    .eq('id', nextScene.id)
    .single()

  return {
    session: updatedSession as GameSession,
    scene: sceneWithChoices as unknown as SceneWithChoices,
    isEnding,
  }
}
