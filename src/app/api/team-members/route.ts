import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/team-members - Get all team members
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

    // Only admin and manager can list all team members
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Get company ID (assuming single company for now)
    const companyId = "00000000-0000-0000-0000-000000000001";

    // Get all active team members for the company
    const { data: teamMembers, error } = await supabase
      .from("team_members")
      .select(`
        *,
        profiles(
          id,
          full_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("profiles(full_name)");

    if (error) {
      console.error("Error fetching team members:", error);
      return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }

    return NextResponse.json({ teamMembers: teamMembers || [] });

  } catch (error) {
    console.error("Error in GET /api/team-members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}