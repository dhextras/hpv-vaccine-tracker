INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vaccine-cards',
  'vaccine-cards',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own vaccine cards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vaccine-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own vaccine cards"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vaccine-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own vaccine cards"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vaccine-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own vaccine cards"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vaccine-cards' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
