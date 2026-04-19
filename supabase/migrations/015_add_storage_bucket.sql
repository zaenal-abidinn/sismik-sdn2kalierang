-- Migration: Create Storage Bucket for Uploads
-- Note: Storage buckets are managed in the 'storage' schema.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies for Storage
-- Allow public read access to images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload
CREATE POLICY "Auth Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    auth.role() = 'authenticated'
  );

-- Allow owners and admins to update/delete
CREATE POLICY "Manage Own Images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'images' AND 
    (auth.uid() = owner OR (SELECT public.get_user_role()) IN ('superadmin', 'kepala_sekolah', 'tata_usaha'))
  );
