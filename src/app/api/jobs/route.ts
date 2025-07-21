import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Validation schema for job creation
const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  service_address: z.string().min(1, "Service address is required"),
  scheduled_date: z.string().min(1, "Scheduled date is required"),
  scheduled_time: z.string().min(1, "Scheduled time is required"),
  customer_id: z.string().uuid("Invalid customer ID"),
  service_type_id: z.string().uuid("Invalid service type ID"),
  estimated_duration: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  special_instructions: z.string().optional(),
  estimated_price: z.number().optional(),
  assigned_manager: z.string().uuid().optional(),
});

// GET /api/jobs - Get all jobs with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const date = searchParams.get("date");
    const customerId = searchParams.get("customer_id");
    const teamMemberId = searchParams.get("team_member_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query based on user role
    let query = supabase
      .from("jobs")
      .select(`
        *,
        customers!inner(
          id,
          business_name,
          service_address,
          profiles(full_name, email)
        ),
        service_types(
          id,
          name,
          description,
          base_price,
          duration_minutes
        ),
        job_assignments(
          id,
          role,
          team_members(
            id,
            profiles(
              id,
              full_name,
              avatar_url
            )
          )
        ),
        job_updates(
          id,
          status,
          notes,
          photos,
          created_at,
          profiles(full_name)
        ),
        job_reviews(
          id,
          rating,
          review_text,
          created_at
        ),
        created_by_profile:profiles!jobs_created_by_fkey(
          id,
          full_name
        ),
        assigned_manager_profile:profiles!jobs_assigned_manager_fkey(
          id,
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply role-based filtering
    if (profile.role === "customer") {
      // Customers can only see their own jobs
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      
      if (customer) {
        query = query.eq("customer_id", customer.id);
      } else {
        return NextResponse.json({ jobs: [], total: 0 });
      }
    } else if (profile.role === "team") {
      // Team members can only see jobs assigned to them
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      
      if (teamMember) {
        // Get job IDs assigned to this team member first
        const { data: assignments } = await supabase
          .from("job_assignments")
          .select("job_id")
          .eq("team_member_id", teamMember.id);
        
        if (assignments && assignments.length > 0) {
          const jobIds = assignments.map(assignment => assignment.job_id);
          query = query.in("id", jobIds);
        } else {
          return NextResponse.json({ jobs: [], total: 0 });
        }
      } else {
        return NextResponse.json({ jobs: [], total: 0 });
      }
    }
    // Admin and Manager can see all jobs (no additional filtering)

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (priority) {
      query = query.eq("priority", priority);
    }
    if (date) {
      query = query.eq("scheduled_date", date);
    }
    if (customerId) {
      query = query.eq("customer_id", customerId);
    }
    if (teamMemberId && (profile.role === "admin" || profile.role === "manager")) {
      // Get job IDs assigned to the specified team member
      const { data: assignments } = await supabase
        .from("job_assignments")
        .select("job_id")
        .eq("team_member_id", teamMemberId);
      
      if (assignments && assignments.length > 0) {
        const jobIds = assignments.map(assignment => assignment.job_id);
        query = query.in("id", jobIds);
      } else {
        return NextResponse.json({ jobs: [], total: 0 });
      }
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    return NextResponse.json({
      jobs: jobs || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error("Error in GET /api/jobs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only admin, manager, and customer can create jobs
    if (!["admin", "manager", "customer"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    // If customer is creating a job, ensure they can only create for themselves
    if (profile.role === "customer") {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      
      if (!customer || customer.id !== validatedData.customer_id) {
        return NextResponse.json({ error: "Can only create jobs for yourself" }, { status: 403 });
      }
    }

    // Get company ID (assuming single company for now)
    const companyId = "00000000-0000-0000-0000-000000000001";

    // Create the job
    const { data: job, error: createError } = await supabase
      .from("jobs")
      .insert({
        ...validatedData,
        company_id: companyId,
        created_by: user.id,
        status: "scheduled"
      })
      .select(`
        *,
        customers(
          business_name,
          service_address,
          profiles(full_name, email)
        ),
        service_types(
          name,
          description,
          base_price,
          duration_minutes
        )
      `)
      .single();

    if (createError) {
      console.error("Error creating job:", createError);
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }

    // Create notification for relevant users
    const notifications = [];
    
    // Notify assigned manager if specified
    if (validatedData.assigned_manager) {
      notifications.push({
        user_id: validatedData.assigned_manager,
        title: "New Job Assigned",
        message: `You have been assigned to manage job: ${validatedData.title}`,
        type: "info",
        related_job_id: job.id
      });
    }

    // Notify all managers if no specific manager assigned
    if (!validatedData.assigned_manager) {
      const { data: managers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "manager");
      
      if (managers) {
        managers.forEach(manager => {
          notifications.push({
            user_id: manager.id,
            title: "New Job Created",
            message: `A new job has been created: ${validatedData.title}`,
            type: "info",
            related_job_id: job.id
          });
        });
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }

    return NextResponse.json({ job }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.format() 
      }, { status: 400 });
    }

    console.error("Error in POST /api/jobs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}