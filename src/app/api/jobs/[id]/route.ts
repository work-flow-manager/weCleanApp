import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Validation schema for job updates
const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  service_address: z.string().min(1).optional(),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  estimated_duration: z.number().optional(),
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled", "issue"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  special_instructions: z.string().optional(),
  estimated_price: z.number().optional(),
  final_price: z.number().optional(),
  assigned_manager: z.string().uuid().optional(),
});

// GET /api/jobs/[id] - Get a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the job with all related data
    let query = supabase
      .from("jobs")
      .select(`
        *,
        customers!inner(
          id,
          business_name,
          service_address,
          billing_address,
          special_instructions,
          profiles(full_name, email, phone)
        ),
        service_types(
          id,
          name,
          description,
          base_price,
          duration_minutes,
          required_team_size
        ),
        job_assignments(
          id,
          role,
          assigned_at,
          team_members(
            id,
            employee_id,
            profiles(
              id,
              full_name,
              avatar_url,
              phone
            )
          )
        ),
        job_updates(
          id,
          status,
          notes,
          location,
          photos,
          created_at,
          profiles(full_name)
        ),
        job_reviews(
          id,
          rating,
          review_text,
          photos,
          created_at
        ),
        created_by_profile:profiles!jobs_created_by_fkey(
          id,
          full_name,
          email
        ),
        assigned_manager_profile:profiles!jobs_assigned_manager_fkey(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq("id", params.id)
      .single();

    const { data: job, error } = await query;

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      console.error("Error fetching job:", error);
      return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
    }

    // Check access permissions
    const hasAccess = await checkJobAccess(supabase, job.id, user.id, profile.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ job });

  } catch (error) {
    console.error("Error in GET /api/jobs/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/jobs/[id] - Update a specific job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only admin, manager, and team can update jobs
    if (!["admin", "manager", "team"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check if job exists and user has access
    const hasAccess = await checkJobAccess(supabase, params.id, user.id, profile.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateJobSchema.parse(body);

    // Team members can only update status and add notes
    if (profile.role === "team") {
      const allowedFields = ["status"];
      const hasDisallowedFields = Object.keys(validatedData).some(
        key => !allowedFields.includes(key)
      );
      
      if (hasDisallowedFields) {
        return NextResponse.json({ 
          error: "Team members can only update job status" 
        }, { status: 403 });
      }
    }

    // Get current job data for comparison
    const { data: currentJob } = await supabase
      .from("jobs")
      .select("status")
      .eq("id", params.id)
      .single();

    // Update the job
    const { data: job, error: updateError } = await supabase
      .from("jobs")
      .update(validatedData)
      .eq("id", params.id)
      .select(`
        *,
        customers(
          business_name,
          profiles(full_name, email)
        ),
        service_types(
          name,
          description
        )
      `)
      .single();

    if (updateError) {
      console.error("Error updating job:", updateError);
      return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
    }

    // Create job update record if status changed
    if (validatedData.status && validatedData.status !== currentJob?.status) {
      await supabase.from("job_updates").insert({
        job_id: params.id,
        updated_by: user.id,
        status: validatedData.status,
        notes: `Status updated to ${validatedData.status}`
      });

      // Create notifications for status changes
      const notifications = [];
      
      // Notify customer
      if (job.customers) {
        const { data: customer } = await supabase
          .from("customers")
          .select("profile_id")
          .eq("id", job.customer_id)
          .single();
        
        if (customer?.profile_id) {
          notifications.push({
            user_id: customer.profile_id,
            title: "Job Status Updated",
            message: `Your job "${job.title}" status has been updated to ${validatedData.status}`,
            type: "info",
            related_job_id: job.id
          });
        }
      }

      // Notify assigned manager
      if (job.assigned_manager) {
        notifications.push({
          user_id: job.assigned_manager,
          title: "Job Status Updated",
          message: `Job "${job.title}" status has been updated to ${validatedData.status}`,
          type: "info",
          related_job_id: job.id
        });
      }

      // Insert notifications
      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }
    }

    return NextResponse.json({ job });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.errors 
      }, { status: 400 });
    }

    console.error("Error in PUT /api/jobs/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/jobs/[id] - Delete a specific job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only admin and manager can delete jobs
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check if job exists
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, status")
      .eq("id", params.id)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Don't allow deletion of completed jobs
    if (job.status === "completed") {
      return NextResponse.json({ 
        error: "Cannot delete completed jobs" 
      }, { status: 400 });
    }

    // Delete the job (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting job:", deleteError);
      return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
    }

    return NextResponse.json({ message: "Job deleted successfully" });

  } catch (error) {
    console.error("Error in DELETE /api/jobs/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to check job access permissions
async function checkJobAccess(
  supabase: any,
  jobId: string,
  userId: string,
  userRole: string
): Promise<boolean> {
  // Admin and manager have access to all jobs
  if (["admin", "manager"].includes(userRole)) {
    return true;
  }

  // Customer can only access their own jobs
  if (userRole === "customer") {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("profile_id", userId)
      .single();
    
    if (!customer) return false;

    const { data: job } = await supabase
      .from("jobs")
      .select("customer_id")
      .eq("id", jobId)
      .eq("customer_id", customer.id)
      .single();
    
    return !!job;
  }

  // Team member can only access jobs assigned to them
  if (userRole === "team") {
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("profile_id", userId)
      .single();
    
    if (!teamMember) return false;

    const { data: assignment } = await supabase
      .from("job_assignments")
      .select("id")
      .eq("job_id", jobId)
      .eq("team_member_id", teamMember.id)
      .single();
    
    return !!assignment;
  }

  return false;
}