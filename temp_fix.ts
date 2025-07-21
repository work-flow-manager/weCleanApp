import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Validation schema for job assignment
const assignmentSchema = z.object({
  team_member_id: z.string().uuid("Invalid team member ID"),
  role: z.string().default("cleaner"),
});

// GET /api/jobs/[jobId]/assignments - Get job assignments
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
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
    const hasAccess = await checkJobAccess(
      supabase,
      params.jobId,
      user.id,
      profile.role,
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Job not found or access denied" },
        { status: 404 },
      );
    }

    // Get job assignments
    const { data: assignments, error } = await supabase
      .from("job_assignments")
      .select(
        `
        *,
        team_members(
          id,
          employee_id,
          performance_rating,
          profiles(
            id,
            full_name,
            avatar_url,
            phone,
            email
          )
        ),
        assigned_by_profile:profiles!job_assignments_assigned_by_fkey(
          id,
          full_name
        )
      `,
      )
      .eq("job_id", params.jobId)
      .order("assigned_at", { ascending: true });

    if (error) {
      console.error("Error fetching job assignments:", error);
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: 500 },
      );
    }

    return NextResponse.json({ assignments: assignments || [] });
  } catch (error) {
    console.error("Error in GET /api/jobs/[jobId]/assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/jobs/[jobId]/assignments - Assign team member to job
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
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

    // Only admin and manager can assign team members
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Check if job exists
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, status")
      .eq("id", params.jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Don't allow assignment to completed or cancelled jobs
    if (["completed", "cancelled"].includes(job.status)) {
      return NextResponse.json(
        {
          error: "Cannot assign team members to completed or cancelled jobs",
        },
        { status: 400 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = assignmentSchema.parse(body);

    // Check if team member exists and is active
    const { data: teamMember } = await supabase
      .from("team_members")
      .select(
        `
        id,
        is_active,
        profiles(
          id,
          full_name,
          email
        )
      `,
      )
      .eq("id", validatedData.team_member_id)
      .eq("is_active", true)
      .single();

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found or inactive" },
        { status: 404 },
      );
    }

    // Check if team member is already assigned to this job
    const { data: existingAssignment } = await supabase
      .from("job_assignments")
      .select("id")
      .eq("job_id", params.jobId)
      .eq("team_member_id", validatedData.team_member_id)
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        {
          error: "Team member is already assigned to this job",
        },
        { status: 400 },
      );
    }

    // Create the assignment
    const { data: assignment, error: assignError } = await supabase
      .from("job_assignments")
      .insert({
        job_id: params.jobId,
        team_member_id: validatedData.team_member_id,
        role: validatedData.role,
        assigned_by: user.id,
      })
      .select(
        `
        *,
        team_members(
          id,
          employee_id,
          profiles(
            id,
            full_name,
            avatar_url,
            phone,
            email
          )
        )
      `,
      )
      .single();

    if (assignError) {
      console.error("Error creating assignment:", assignError);
      return NextResponse.json(
        { error: "Failed to assign team member" },
        { status: 500 },
      );
    }

    // Create notification for the assigned team member
    if (teamMember.profiles) {
      const profileId = Array.isArray(teamMember.profiles) && teamMember.profiles.length > 0
        ? teamMember.profiles[0].id
        : teamMember.profiles.id;
        
      if (profileId) {
        await supabase.from("notifications").insert({
          user_id: profileId,
          title: "New Job Assignment",
          message: `You have been assigned to job: ${job.title}`,
          type: "job_assigned",
          related_job_id: params.jobId,
        });
      }
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Error in POST /api/jobs/[jobId]/assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to check job access permissions
async function checkJobAccess(
  supabase: any,
  jobId: string,
  userId: string,
  userRole: string,
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