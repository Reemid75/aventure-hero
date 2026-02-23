-- Bucket public pour les visuels des scènes
INSERT INTO storage.buckets (id, name, public)
VALUES ('scene-visuals', 'scene-visuals', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique
CREATE POLICY "Public read scene visuals"
ON storage.objects FOR SELECT
USING (bucket_id = 'scene-visuals');

-- Upload réservé aux admins
CREATE POLICY "Admins can upload scene visuals"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'scene-visuals' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Remplacement réservé aux admins
CREATE POLICY "Admins can update scene visuals"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'scene-visuals' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Suppression réservée aux admins
CREATE POLICY "Admins can delete scene visuals"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'scene-visuals' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
