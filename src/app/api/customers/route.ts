import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/customers - Get all customers
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

    // If user is a customer, they can only see themselves
    if (profile.role === "customer") {
      const { data: customer, error } = await supabase
        .from("customers")
        .select(`
          *,
          profiles(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq("profile_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching customer:", error);
        return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
      }

      return NextResponse.json({ customers: customer ? [customer] : [] });
    }

    // Admin and manager can see all customers
    if (["admin", "manager"].includes(profile.role)) {
      const { data: customers, error } = await supabase
        .from("customers")
        .select(`
          *,
          profiles(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq("company_id", companyId)
        .order("business_name", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
      }

      return NextResponse.json({ customers: customers || [] });
    }

    // Team members don't need to see customers
    return NextResponse.json({ customers: [] });

  } catch (error) {
    console.error("Error in GET /api/customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/customers - Create a new customer
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

    // Only admin and manager can create customers
    if (!["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.customer_type || !body.service_address) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: "Customer type and service address are required" 
      }, { status: 400 });
    }

    // Get company ID (assuming single company for now)
    const companyId = "00000000-0000-0000-0000-000000000001";

    // Create the customer
    const { data: customer, error: createError } = await supabase
      .from("customers")
      .insert({
        company_id: companyId,
        customer_type: body.customer_type,
        business_name: body.business_name,
        service_address: body.service_address,
        billing_address: body.billing_address || body.service_address,
        special_instructions: body.special_instructions,
        profile_id: body.profile_id // Optional link to user profile
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating customer:", createError);
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }

    return NextResponse.json({ customer }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}