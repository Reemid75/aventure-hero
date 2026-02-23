-- Correction de la contrainte FK scene_visits → choices
-- La suppression d'un choix met choice_id à NULL dans scene_visits
-- plutôt que de bloquer la suppression

ALTER TABLE public.scene_visits
  DROP CONSTRAINT scene_visits_choice_id_fkey;

ALTER TABLE public.scene_visits
  ADD CONSTRAINT scene_visits_choice_id_fkey
  FOREIGN KEY (choice_id)
  REFERENCES public.choices(id)
  ON DELETE SET NULL;
