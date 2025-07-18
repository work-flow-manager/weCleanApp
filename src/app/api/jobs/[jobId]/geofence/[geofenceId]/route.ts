import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string; geofenceId: string } },
) {
  try {
    const { jobId, geofenceId } = params;
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

    // Only admin and managers can update geofences
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Only admins and managers can update geofences" },
        { status: 403 },
      );
    }

    // Check if geofence exists
    const { data: existingGeofence, error: existingError } = await supabase
      .from("job_geofences")
      .select("id, job_id")
      .eq("id", geofenceId)
      .single();

    if (existingError || !existingGeofence) {
      return NextResponse.json(
        { error: "Geofence not found" },
        { status: 404 },
      );
    }

    // Verify the geofence belongs to the specified job
    if (existingGeofence.job_id !== jobId) {
      return NextResponse.json(
        { error: "Geofence does not belong to the specified job" },
        { status: 400 },
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

    // Update geofence
    const { data: geofence, error } = await supabase
      .from("job_geofences")
      .update({
        radius,
        notification_on_enter: notificationOnEnter ?? true,
        notification_on_exit: notificationOnExit ?? true,
      })
      .eq("id", geofenceId)
      .select()
      .single();

    if (error) {
      console.error("Error updating job geofence:", error);
      return NextResponse.json(
        { error: "Failed to update job geofence" },
        { status: 500 },
      );
    }

    return NextResponse.json({ geofence });
  } catch (error) {
    console.error("Error in job geofence update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string; geofenceId: string } },
) {
  try {
    const { jobId, geofenceId } = params;
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

    // Only admin and managers can delete geofences
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Only admins and managers can delete geofences" },
        { status: 403 },
      );
    }

    // Check if geofence exists and belongs to the specified job
    const { data: existingGeofence, error: existingError } = await supabase
      .from("job_geofences")
      .select("job_id")
      .eq("id", geofenceId)
      .single();

    if (existingError || !existingGeofence) {
      return NextResponse.json(
        { error: "Geofence not found" },
        { status: 404 },
      );
    }

    // Verify the geofence belongs to the specified job
    if (existingGeofence.job_id !== jobId) {
      return NextResponse.json(
        { error: "Geofence does not belong to the specified job" },
        { status: 400 },
      );
    }

    // Delete geofence
    const { error } = await supabase
      .from("job_geofences")
      .delete()
      .eq("id", geofenceId);

    if (error) {
      console.error("Error deleting job geofence:", error);
      return NextResponse.json(
        { error: "Failed to delete job geofence" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in job geofence deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
