-- Add location privacy settings to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_tracking_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_share_accuracy BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_track_only_during_shift BOOLEAN DEFAULT true;

-- Create function to get latest team locations
CREATE OR REPLACE FUNCTION get_latest_team_locations(team_ids UUID[])
RETURNS TABLE (
  team_member_id UUID,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy DECIMAL(10, 2),
  timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_timestamps AS (
    SELECT 
      team_member_id,
      MAX(timestamp) as latest_timestamp
    FROM 
      team_locations
    WHERE 
      team_member_id = ANY(team_ids)
    GROUP BY 
      team_member_id
  )
  SELECT 
    tl.team_member_id,
    tl.latitude,
    tl.longitude,
    tl.accuracy,
    tl.timestamp
  FROM 
    team_locations tl
  JOIN 
    latest_timestamps lt ON tl.team_member_id = lt.team_member_id AND tl.timestamp = lt.latest_timestamp;
END;
$$ LANGUAGE plpgsql;

-- Create geofencing table for job locations
CREATE TABLE IF NOT EXISTS job_geofences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  radius INTEGER NOT NULL DEFAULT 100, -- radius in meters
  notification_on_enter BOOLEAN DEFAULT true,
  notification_on_exit BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add RLS policy for job_geofences
ALTER TABLE job_geofences ENABLE ROW LEVEL SECURITY;

-- Create policy for job_geofences
CREATE POLICY "Team members can view geofences for their assigned jobs" 
  ON job_geofences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_team_members jtm
      JOIN team_members tm ON jtm.team_member_id = tm.id
      JOIN profiles p ON tm.profile_id = p.id
      WHERE jtm.job_id = job_geofences.job_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'manager')
    )
  );

CREATE POLICY "Admins and managers can manage geofences" 
  ON job_geofences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'manager')
    )
  );

-- Create policy for team_locations
CREATE POLICY "Users can insert their own location" 
  ON team_locations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON tm.profile_id = p.id
      WHERE tm.id = team_locations.team_member_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can view locations from their company" 
  ON team_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.company_id = tm2.company_id
      JOIN profiles p ON tm1.profile_id = p.id
      WHERE tm2.id = team_locations.team_member_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own location data" 
  ON team_locations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN profiles p ON tm.profile_id = p.id
      WHERE tm.id = team_locations.team_member_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'manager')
    )
  );

-- Create index for team_locations to improve query performance
CREATE INDEX IF NOT EXISTS team_locations_team_member_id_timestamp_idx 
  ON team_locations(team_member_id, timestamp DESC);

-- Create index for job_geofences to improve query performance
CREATE INDEX IF NOT EXISTS job_geofences_job_id_idx 
  ON job_geofences(job_id);