-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-items',
  'menu-items',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS policies for menu item images
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-items' AND
  auth.uid() IN (
    SELECT merchant_id FROM restaurants
  )
);

CREATE POLICY "Anyone can view menu images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-items');

CREATE POLICY "Restaurant owners can update their menu images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-items' AND
  auth.uid() IN (
    SELECT merchant_id FROM restaurants
  )
);

CREATE POLICY "Restaurant owners can delete their menu images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-items' AND
  auth.uid() IN (
    SELECT merchant_id FROM restaurants
  )
);