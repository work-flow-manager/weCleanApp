import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/service-types - Get all service types
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

    // Get company ID (assuming single company for now)
    const companyId = "00000000-0000-0000-0000-000000000001";

    // Get all active service types for the company
    const { data: serviceTypes, error } = await supabase
      .from("service_types")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching service types:", error);
      return NextResponse.json({ error: "Failed to fetch service types" }, { status: 500 });
    }

    return NextResponse.json({ serviceTypes: serviceTypes || [] });

  } catch (error) {
    console.error("Error in GET /api/service-types:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}