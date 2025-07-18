-- Create shared_routes table
CREATE TABLE IF NOT EXISTS shared_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  route_data JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create route_shares table
CREATE TABLE IF NOT EXISTS route_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES shared_routes(id) ON DELETE CASCADE NOT NULL,
  team_member_id UUID REFERENCES team_members(id) NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE (route_id, team_member_id)
);

-- Add RLS policies
ALTER TABLE shared_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_shares ENABLE ROW LEVEL SECURITY;

-- Policies for shared_routes
CREATE POLICY "Admins and managers can manage shared routes"
  ON shared_routes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'manager')
    )
  );

CREATE POLICY "Team members can view routes shared with them"
  ON shared_routes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM route_shares
      JOIN team_members ON route_shares.team_member_id = team_members.id
      WHERE route_shares.route_id = shared_routes.id
      AND team_members.profile_id = auth.uid()
    )
  );

-- Policies for route_shares
CREATE POLICY "Admins and managers can manage route shares"
  ON route_shares
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'manager')
    )
  );

CREATE POLICY "Team members can view their route shares"
  ON route_shares
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.id = route_shares.team_member_id
      AND team_members.profile_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS shared_routes_created_by_idx ON shared_routes(created_by);
CREATE INDEX IF NOT EXISTS route_shares_route_id_idx ON route_shares(route_id);
CREATE INDEX IF NOT EXISTS route_shares_team_member_id_idx ON route_shares(team_member_id);