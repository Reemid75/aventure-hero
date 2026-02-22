-- ============================================================
-- Migration 002 — Journal système (mots-clés)
-- ============================================================

-- Mots-clés ajoutés au journal du joueur quand il consulte la scène
ALTER TABLE public.scenes
  ADD COLUMN keywords TEXT[] NOT NULL DEFAULT '{}';

-- Mots-clés que le joueur doit posséder pour accéder à la scène
ALTER TABLE public.scenes
  ADD COLUMN required_keywords TEXT[] NOT NULL DEFAULT '{}';

-- Journal du joueur pour cette session (mots-clés accumulés)
ALTER TABLE public.game_sessions
  ADD COLUMN journal TEXT[] NOT NULL DEFAULT '{}';
