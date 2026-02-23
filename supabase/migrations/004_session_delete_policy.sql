-- Permet au joueur de supprimer ses propres sessions (pour recommencer une aventure)
CREATE POLICY "Players can delete own sessions"
  ON public.game_sessions FOR DELETE
  USING (player_id = auth.uid());
