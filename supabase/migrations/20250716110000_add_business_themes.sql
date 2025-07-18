-- Create business_themes table for white-label theme customization
CREATE TABLE IF NOT EXISTS business_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  theme_settings JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add theme_settings column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS theme_settings JSONB;

-- Add trigger for updated_at
CREATE TRIGGER update_business_themes_updated_at 
BEFORE UPDATE ON business_themes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for business_themes
CREATE POLICY "Users can view their business themes"
  ON business_themes FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE business_id = business_themes.business_id
    UNION
    SELECT business_id FROM business_themes WHERE business_id = auth.uid()
  ));

CREATE POLICY "Admins can insert business themes"
  ON business_themes FOR INSERT
  WITH CHECK (
    auth.uid() = business_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE business_id = business_themes.business_id AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update business themes"
  ON business_themes FOR UPDATE
  USING (
    auth.uid() = business_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE business_id = business_themes.business_id AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete business themes"
  ON business_themes FOR DELETE
  USING (
    auth.uid() = business_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE business_id = business_themes.business_id AND role = 'admin'
    )
  );

-- Add to realtime publication
ALTER publication supabase_realtime ADD TABLE business_themes;