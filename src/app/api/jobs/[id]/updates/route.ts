import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Validation schema for job updates
const jobUpdateSchema = z.object({
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled", "issue"]).optional(),
  notes: z.string().min(1, "Notes are required"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  photos: z.array(z.string().url()).optional(),
});

// GET /api/jobs/[id]/updates - Get job updates
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
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if user has access to this job
    const hasAccess = await checkJobAccess(supabase, params.id, user.id, profile.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
    }

    // Get job updates
    const { data: updates, error } = await supabase
      .from("job_updates")
      .select(`
        *,
        profiles(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("job_id", params.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching job updates:", error);
      return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 });
    }

    return NextResponse.json({ updates: updates || [] });

  } catch (error) {
    console.error("Error in GET /api/jobs/[id]/updates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/jobs/[id]/updates - Create job update
export async function POST(
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

    // Only admin, manager, and team can create updates
    if (!["admin", "manager", "team"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check if user has access to this job
    const hasAccess = await checkJobAccess(supabase, params.id, user.id, profile.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = jobUpdateSchema.parse(body);

    // Convert location to PostGIS point format if provided
    let locationPoint = null;
    if (validatedData.location) {
      locationPoint = `POINT(${validatedData.location.longitude} ${validatedData.location.latitude})`;
    }

    // Create the job update
    const { data: update, error: updateError } = await supabase
      .from("job_updates")
      .insert({
        job_id: params.id,
        updated_by: user.id,
        status: validatedData.status,
        notes: validatedData.notes,
        location: locationPoint,
        photos: validatedData.photos || []
      })
      .select(`
        *,
        profiles(
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      console.error("Error creating job update:", updateError);
      return NextResponse.json({ error: "Failed to create update" }, { status: 500 });
    }

    // Update job status if provided
    if (validatedData.status) {
      const { error: jobUpdateError } = await supabase
        .from("jobs")
        .update({ status: validatedData.status })
        .eq("id", params.id);

      if (jobUpdateError) {
        console.error("Error updating job status:", jobUpdateError);
      }
    }

    // Get job details for notifications
    const { data: job } = await supabase
      .from("jobs")
      .select(`
        title,
        customer_id,
        assigned_manager,
        customers(profile_id)
      `)
      .eq("id", params.id)
      .single();

    if (job) {
      const notifications = [];

      // Notify customer
      if (job.customers?.profile_id) {
        notifications.push({
          user_id: job.customers.profile_id,
          title: "Job Update",
          message: `Update on your job "${job.title}": ${validatedData.notes}`,
          type: "info",
          related_job_id: params.id
        });
      }

      // Notify assigned manager (if not the one creating the update)
      if (job.assigned_manager && job.assigned_manager !== user.id) {
        notifications.push({
          user_id: job.assigned_manager,
          title: "Job Update",
          message: `Update on job "${job.title}": ${validatedData.notes}`,
          type: "info",
          related_job_id: params.id
        });
      }

      // Insert notifications
      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }
    }

    return NextResponse.json({ update }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.errors 
      }, { status: 400 });
    }

    console.error("Error in POST /api/jobs/[id]/updates:", error);
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