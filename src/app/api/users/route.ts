import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/users - Get users with optional role filtering
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
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only admin and manager can list users
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    // Build query
    let query = supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url");
    
    // Apply role filter if provided
    if (role) {
      query = query.eq("role", role);
    }

    // Execute query
    const { data: users, error } = await query.order("full_name");

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });

  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}