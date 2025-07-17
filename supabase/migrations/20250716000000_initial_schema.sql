-- Create profiles table to store user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'team', 'customer')) NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'pt')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#EC4899',
  secondary_color TEXT DEFAULT '#F472B6',
  accent_color TEXT DEFAULT '#FBBF24',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id) NOT NULL,
  customer_type TEXT CHECK (customer_type IN ('individual', 'business')) NOT NULL,
  business_name TEXT,
  billing_address TEXT,
  service_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  employee_id TEXT,
  hire_date DATE,
  hourly_rate DECIMAL(10, 2),
  skills TEXT[],
  availability JSONB,
  performance_rating DECIMAL(3, 2) DEFAULT 5.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create service_types table
CREATE TABLE IF NOT EXISTS service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2),
  duration_minutes INTEGER,
  required_team_size INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  service_type_id UUID REFERENCES service_types(id),
  title TEXT NOT NULL,
  description TEXT,
  service_address TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  estimated_duration INTEGER,
  status TEXT CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'issue')) NOT NULL DEFAULT 'scheduled',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL DEFAULT 'medium',
  special_instructions TEXT,
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  assigned_manager UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create job_assignments table
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  team_member_id UUID REFERENCES team_members(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  assigned_by UUID REFERENCES profiles(id) NOT NULL,
  UNIQUE (job_id, team_member_id)
);

-- Create job_updates table
CREATE TABLE IF NOT EXISTS job_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  updated_by UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'issue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create job_photos table
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('before', 'after', 'issue', 'other')) NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) NOT NULL DEFAULT 'draft',
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create team_locations table
CREATE TABLE IF NOT EXISTS team_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID REFERENCES team_members(id) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('job_assigned', 'status_update', 'review_received', 'payment_received', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create profile trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create default company for demo purposes
INSERT INTO companies (id, name, email, phone, website)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'We-Clean Demo Company',
  'info@we-clean.app',
  '+1234567890',
  'https://we-clean.app'
) ON CONFLICT DO NOTHING;

-- Create default service types for demo purposes
INSERT INTO service_types (company_id, name, description, base_price, duration_minutes, required_team_size)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Regular Cleaning', 'Standard cleaning service', 100.00, 120, 1),
  ('00000000-0000-0000-0000-000000000001', 'Deep Cleaning', 'Thorough cleaning of all areas', 200.00, 240, 2),
  ('00000000-0000-0000-0000-000000000001', 'Move-in/Move-out Cleaning', 'Complete cleaning for moving', 250.00, 300, 2),
  ('00000000-0000-0000-0000-000000000001', 'Post-Construction Cleaning', 'Cleaning after construction work', 300.00, 360, 3)
ON CONFLICT DO NOTHING;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for jobs
CREATE POLICY "Admins and managers can view all jobs"
  ON jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'manager')
      AND profiles.id IN (
        SELECT profile_id FROM team_members
        WHERE company_id = jobs.company_id
      )
    )
  );

CREATE POLICY "Team members can view their assigned jobs"
  ON jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_assignments
      JOIN team_members ON job_assignments.team_member_id = team_members.id
      WHERE job_assignments.job_id = jobs.id
      AND team_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their own jobs"
  ON jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = jobs.customer_id
      AND customers.profile_id = auth.uid()
    )
  );

-- Create RLS policies for job_photos
CREATE POLICY "Anyone can view job photos"
  ON job_photos FOR SELECT
  USING (true);

CREATE POLICY "Team members can upload job photos"
  ON job_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_assignments
      JOIN team_members ON job_assignments.team_member_id = team_members.id
      WHERE job_assignments.job_id = job_photos.job_id
      AND team_members.profile_id = auth.uid()
    )
  );

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews for their jobs"
  ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = reviews.job_id
      AND jobs.customer_id = reviews.customer_id
      AND EXISTS (
        SELECT 1 FROM customers
        WHERE customers.id = reviews.customer_id
        AND customers.profile_id = auth.uid()
      )
    )
  );

-- Create RLS policies for invoices
CREATE POLICY "Admins and managers can view all invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'manager')
      AND profiles.id IN (
        SELECT profile_id FROM team_members
        WHERE company_id = invoices.company_id
      )
    )
  );

CREATE POLICY "Customers can view their own invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = invoices.customer_id
      AND customers.profile_id = auth.uid()
    )
  );

-- Create RLS policies for invoice_items
CREATE POLICY "Anyone can view invoice items"
  ON invoice_items FOR SELECT
  USING (true);