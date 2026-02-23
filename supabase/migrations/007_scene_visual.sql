-- Visuel facultatif associé à une scène (URL d'image)
ALTER TABLE public.scenes
  ADD COLUMN visual_url TEXT;
