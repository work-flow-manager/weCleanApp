import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string; photoId: string } },
) {
  try {
    const { jobId, photoId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the photo
    const { data, error } = await supabase
      .from("job_photos")
      .select(
        `
        *,
        profiles (id, full_name, avatar_url)
      `,
      )
      .eq("id", photoId)
      .eq("job_id", jobId)
      .single();

    if (error) {
      console.error("Error getting photo:", error);
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ photo: data });
  } catch (error) {
    console.error("Error in photo retrieval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string; photoId: string } },
) {
  try {
    const { jobId, photoId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { type, caption } = body;

    // Validate type if provided
    if (type && !["before", "after", "issue", "other"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid photo type" },
        { status: 400 },
      );
    }

    // Check if photo exists and belongs to the job
    const { data: existingPhoto, error: checkError } = await supabase
      .from("job_photos")
      .select("id, uploaded_by")
      .eq("id", photoId)
      .eq("job_id", jobId)
      .single();

    if (checkError) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Get user role
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // Check if user has permission to update the photo
    const isAdmin = userProfile.role === "admin";
    const isManager = userProfile.role === "manager";
    const isOwner = existingPhoto.uploaded_by === session.user.id;

    if (!isAdmin && !isManager && !isOwner) {
      return NextResponse.json(
        { error: "You do not have permission to update this photo" },
        { status: 403 },
      );
    }

    // Update the photo
    const updateData: any = {};
    if (type) updateData.type = type;
    if (caption !== undefined) updateData.caption = caption || null;

    const { data, error } = await supabase
      .from("job_photos")
      .update(updateData)
      .eq("id", photoId)
      .select()
      .single();

    if (error) {
      console.error("Error updating photo:", error);
      return NextResponse.json(
        { error: "Failed to update photo" },
        { status: 500 },
      );
    }

    return NextResponse.json({ photo: data });
  } catch (error) {
    console.error("Error in photo update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string; photoId: string } },
) {
  try {
    const { jobId, photoId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if photo exists and belongs to the job
    const { data: photo, error: checkError } = await supabase
      .from("job_photos")
      .select("id, uploaded_by, url")
      .eq("id", photoId)
      .eq("job_id", jobId)
      .single();

    if (checkError) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Get user role
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // Check if user has permission to delete the photo
    const isAdmin = userProfile.role === "admin";
    const isManager = userProfile.role === "manager";
    const isOwner = photo.uploaded_by === session.user.id;

    if (!isAdmin && !isManager && !isOwner) {
      return NextResponse.json(
        { error: "You do not have permission to delete this photo" },
        { status: 403 },
      );
    }

    // Extract the path from the URL
    const url = new URL(photo.url);
    const path = url.pathname.split("/").slice(-2).join("/");

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("job-photos")
      .remove([path]);

    if (storageError) {
      console.error("Error deleting photo from storage:", storageError);
      // Continue despite storage error, as the record is more important
    }

    // Delete the record
    const { error } = await supabase
      .from("job_photos")
      .delete()
      .eq("id", photoId);

    if (error) {
      console.error("Error deleting photo record:", error);
      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in photo deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
