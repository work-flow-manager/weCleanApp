CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'team', 'customer')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#ec4899',
  secondary_color TEXT DEFAULT '#f9a8d4',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  customer_type TEXT CHECK (customer_type IN ('individual', 'business')) DEFAULT 'individual',
  business_name TEXT,
  billing_address TEXT,
  service_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  employee_id TEXT,
  hire_date DATE,
  hourly_rate DECIMAL(10,2),
  skills TEXT[],
  availability JSONB,
  performance_rating DECIMAL(3,2) DEFAULT 5.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  duration_minutes INTEGER,
  required_team_size INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  customer_id UUID REFERENCES customers(id),
  service_type_id UUID REFERENCES service_types(id),
  title TEXT NOT NULL,
  description TEXT,
  service_address TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  estimated_duration INTEGER,
  status TEXT CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'issue')) DEFAULT 'scheduled',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  special_instructions TEXT,
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  created_by UUID REFERENCES profiles(id),
  assigned_manager UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id),
  role TEXT DEFAULT 'cleaner',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  UNIQUE(job_id, team_member_id)
);

CREATE TABLE IF NOT EXISTS job_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES profiles(id),
  status TEXT,
  notes TEXT,
  location POINT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON service_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table companies;
alter publication supabase_realtime add table customers;
alter publication supabase_realtime add table team_members;
alter publication supabase_realtime add table service_types;
alter publication supabase_realtime add table jobs;
alter publication supabase_realtime add table job_assignments;
alter publication supabase_realtime add table job_updates;
alter publication supabase_realtime add table job_reviews;
alter publication supabase_realtime add table notifications;

INSERT INTO companies (id, name, primary_color, secondary_color) 
VALUES ('00000000-0000-0000-0000-000000000001', 'We-Clean Demo Company', '#ec4899', '#f9a8d4')
ON CONFLICT DO NOTHING;

INSERT INTO service_types (company_id, name, description, base_price, duration_minutes, required_team_size)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Regular House Cleaning', 'Standard residential cleaning service', 120.00, 120, 2),
  ('00000000-0000-0000-0000-000000000001', 'Deep Office Cleaning', 'Comprehensive office cleaning service', 200.00, 180, 3),
  ('00000000-0000-0000-0000-000000000001', 'Post-Construction Cleanup', 'Heavy-duty cleaning after construction', 350.00, 240, 4),
  ('00000000-0000-0000-0000-000000000001', 'Move-Out Cleaning', 'Complete cleaning for move-out situations', 180.00, 150, 2),
  ('00000000-0000-0000-0000-000000000001', 'Restaurant Kitchen Deep Clean', 'Specialized kitchen cleaning service', 400.00, 300, 3)
ON CONFLICT DO NOTHING;