-- Items collectables sur une scène (le joueur choisit de les ramasser)
ALTER TABLE public.scenes
  ADD COLUMN item_keywords TEXT[] NOT NULL DEFAULT '{}';

-- Inventaire du joueur pour cette session (items ramassés manuellement)
ALTER TABLE public.game_sessions
  ADD COLUMN items TEXT[] NOT NULL DEFAULT '{}';
