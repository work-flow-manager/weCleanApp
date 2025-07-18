-- Add branding fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS email_header TEXT DEFAULT 'Welcome to {business_name}!',
ADD COLUMN IF NOT EXISTS email_footer TEXT DEFAULT 'Thank you for choosing {business_name}!',
ADD COLUMN IF NOT EXISTS email_signature TEXT DEFAULT 'The {business_name} Team';

-- Create storage bucket for business assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for business assets
CREATE POLICY "Business admins can upload assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-assets' AND
    (auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND business_id = (
        SELECT business_id FROM profiles WHERE id = auth.uid()
      )
    ) OR auth.uid() IN (
      SELECT id FROM businesses WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Business users can view their business assets"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'business-assets' AND
    (
      -- Extract business ID from path (format: business-logos/{businessId}/*)
      SPLIT_PART(storage.foldername(name), '/', 1) = (
        SELECT business_id::text FROM profiles WHERE id = auth.uid()
      ) OR
      SPLIT_PART(storage.foldername(name), '/', 1) = auth.uid()::text
    )
  );

CREATE POLICY "Business admins can update their business assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-assets' AND
    (
      -- Extract business ID from path (format: business-logos/{businessId}/*)
      SPLIT_PART(storage.foldername(name), '/', 1) = (
        SELECT business_id::text FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ) OR
      SPLIT_PART(storage.foldername(name), '/', 1) = auth.uid()::text
    )
  );

CREATE POLICY "Business admins can delete their business assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-assets' AND
    (
      -- Extract business ID from path (format: business-logos/{businessId}/*)
      SPLIT_PART(storage.foldername(name), '/', 1) = (
        SELECT business_id::text FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ) OR
      SPLIT_PART(storage.foldername(name), '/', 1) = auth.uid()::text
    )
  );