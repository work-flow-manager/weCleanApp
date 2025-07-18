import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { jobId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the geofence for this job
    const { data, error } = await supabase
      .from("job_geofences")
      .select("*")
      .eq("job_id", jobId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error getting job geofence:", error);
      return NextResponse.json(
        { error: "Failed to get job geofence" },
        { status: 500 },
      );
    }

    return NextResponse.json({ geofence: data || null });
  } catch (error) {
    console.error("Error in job geofence retrieval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { jobId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // Only admin and managers can create geofences
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Only admins and managers can create geofences" },
        { status: 403 },
      );
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", jobId)
      .single();

    if (jobError) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if geofence already exists for this job
    const { data: existingGeofence, error: existingError } = await supabase
      .from("job_geofences")
      .select("id")
      .eq("job_id", jobId)
      .single();

    if (existingGeofence) {
      return NextResponse.json(
        { error: "Geofence already exists for this job" },
        { status: 409 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { radius, notificationOnEnter, notificationOnExit } = body;

    // Validate required fields
    if (typeof radius !== "number" || radius <= 0) {
      return NextResponse.json(
        { error: "Radius is required and must be a positive number" },
        { status: 400 },
      );
    }

    // Create geofence
    const { data: geofence, error } = await supabase
      .from("job_geofences")
      .insert({
        job_id: jobId,
        radius,
        notification_on_enter: notificationOnEnter ?? true,
        notification_on_exit: notificationOnExit ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating job geofence:", error);
      return NextResponse.json(
        { error: "Failed to create job geofence" },
        { status: 500 },
      );
    }

    return NextResponse.json({ geofence });
  } catch (error) {
    console.error("Error in job geofence creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
