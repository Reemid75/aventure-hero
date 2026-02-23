-- Les admins peuvent consulter toutes les sessions (pour le dashboard admin)
CREATE POLICY "Admins can view all sessions"
  ON public.game_sessions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
