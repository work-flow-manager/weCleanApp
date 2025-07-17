import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "admin" | "manager" | "team" | "customer";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  role: UserRole = "customer", // Default to customer
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "customer", // Always create as customer initially
      },
    },
  });

  if (error) throw error;
  return data;
};

// Create customer profile after signup
export const createCustomerProfile = async (
  userId: string,
  email: string,
  fullName: string,
) => {
  const defaultCompanyId = "00000000-0000-0000-0000-000000000001";

  try {
    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: "customer",
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Create customer record
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        profile_id: userId,
        company_id: defaultCompanyId,
        customer_type: "individual",
      })
      .select()
      .single();

    if (customerError) throw customerError;

    return { profile, customer };
  } catch (error) {
    console.error("Error creating customer profile:", error);
    throw error;
  }
};

// Promote customer to team member (manager function)
export const promoteToTeamMember = async (
  profileId: string,
  companyId: string,
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  // Check if current user is manager or admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || !["manager", "admin"].includes(currentProfile.role)) {
    throw new Error("Only managers and admins can promote users");
  }

  // Update profile role
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "team" })
    .eq("id", profileId);

  if (profileError) throw profileError;

  // Create team member record
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      profile_id: profileId,
      company_id: companyId,
      hire_date: new Date().toISOString().split("T")[0],
      performance_rating: 5.0,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create company (super admin function)
export const createCompany = async (companyData: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  // Check if current user is super admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    throw new Error("Only super admins can create companies");
  }

  const { data, error } = await supabase
    .from("companies")
    .insert(companyData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Assign manager to company (super admin function)
export const assignManager = async (profileId: string, companyId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  // Check if current user is super admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    throw new Error("Only super admins can assign managers");
  }

  // Update profile role to manager
  const { error } = await supabase
    .from("profiles")
    .update({ role: "manager" })
    .eq("id", profileId);

  if (error) throw error;

  return true;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};

// Job-related types and functions
export interface Job {
  id: string;
  company_id: string;
  customer_id: string;
  service_type_id: string;
  title: string;
  description?: string;
  service_address: string;
  scheduled_date: string;
  scheduled_time: string;
  estimated_duration?: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "issue";
  priority: "low" | "medium" | "high" | "urgent";
  special_instructions?: string;
  estimated_price?: number;
  final_price?: number;
  created_by: string;
  assigned_manager?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  profile_id?: string;
  company_id: string;
  customer_type: "individual" | "business";
  business_name?: string;
  billing_address?: string;
  service_address?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceType {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  base_price?: number;
  duration_minutes?: number;
  required_team_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  profile_id: string;
  company_id: string;
  employee_id?: string;
  hire_date?: string;
  hourly_rate?: number;
  skills?: string[];
  availability?: any;
  performance_rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export const createJob = async (jobData: {
  title: string;
  service_address: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_name: string;
  customer_email?: string;
  service_type_id?: string;
  description?: string;
  special_instructions?: string;
}) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  // First, create or find customer
  let customer_id: string;

  // Check if customer exists by name (simplified for demo)
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("business_name", jobData.customer_name)
    .single();

  if (existingCustomer) {
    customer_id = existingCustomer.id;
  } else {
    // Create new customer
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        company_id: "00000000-0000-0000-0000-000000000001", // Demo company ID
        customer_type: "business",
        business_name: jobData.customer_name,
        service_address: jobData.service_address,
      })
      .select("id")
      .single();

    if (customerError) throw customerError;
    customer_id = newCustomer.id;
  }

  // Get default service type if not provided
  let service_type_id = jobData.service_type_id;
  if (!service_type_id) {
    const { data: defaultService } = await supabase
      .from("service_types")
      .select("id")
      .eq("company_id", "00000000-0000-0000-0000-000000000001")
      .limit(1)
      .single();

    service_type_id = defaultService?.id;
  }

  // Create the job
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      company_id: "00000000-0000-0000-0000-000000000001", // Demo company ID
      customer_id,
      service_type_id,
      title: jobData.title,
      description: jobData.description,
      service_address: jobData.service_address,
      scheduled_date: jobData.scheduled_date,
      scheduled_time: jobData.scheduled_time,
      special_instructions: jobData.special_instructions,
      created_by: user.id,
      status: "scheduled",
      priority: "medium",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      customers!inner(
        business_name,
        service_address
      ),
      service_types(
        name,
        description
      ),
      job_assignments(
        team_members(
          id,
          profiles(
            full_name,
            avatar_url
          )
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateJobStatus = async (jobId: string, status: Job["status"]) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId)
    .select()
    .single();

  if (error) throw error;

  // Create job update record
  await supabase.from("job_updates").insert({
    job_id: jobId,
    updated_by: user.id,
    status,
    notes: `Status updated to ${status}`,
  });

  return data;
};

export const getServiceTypes = async () => {
  const { data, error } = await supabase
    .from("service_types")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
};

export const getTeamMembers = async () => {
  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      *,
      profiles(
        full_name,
        avatar_url,
        email
      )
    `,
    )
    .eq("is_active", true)
    .order("profiles(full_name)");

  if (error) throw error;
  return data;
};
