-- Remplace la contrainte unique globale par un index partiel :
-- un seul session ACTIVE par joueur par histoire, mais les sessions terminées s'accumulent.
ALTER TABLE public.game_sessions DROP CONSTRAINT one_active_session_per_story;

CREATE UNIQUE INDEX one_active_session_per_story
  ON public.game_sessions (player_id, story_id)
  WHERE status = 'active';
