CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  
  INSERT INTO customers (profile_id, company_id, customer_type)
  VALUES (
    NEW.id,
    '00000000-0000-0000-0000-000000000001',
    'individual'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION get_user_with_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  customer_id UUID,
  team_member_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.avatar_url,
    p.phone,
    p.address,
    p.created_at,
    p.updated_at,
    c.id as customer_id,
    tm.id as team_member_id
  FROM profiles p
  LEFT JOIN customers c ON c.profile_id = p.id
  LEFT JOIN team_members tm ON tm.profile_id = p.id
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



INSERT INTO notifications (user_id, title, message, type)
SELECT 
  p.id,
  'Welcome to We-Clean!',
  'Your customer account has been created successfully. You can now schedule cleaning services.',
  'success'
FROM profiles p
WHERE p.role = 'customer'
AND NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = p.id 
  AND n.title = 'Welcome to We-Clean!'
);

