import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    // Get photos for the job
    let query = supabase
      .from('job_photos')
      .select('*')
      .eq('job_id', jobId);
    
    // Filter by type if provided
    if (type) {
      query = query.eq('type', type);
    }
    
    // Order by creation date
    query = query.order('created_at', { ascending: true });
    
    const { data, error } = await query;

    if (error) {
      console.error('Error getting job photos:', error);
      return NextResponse.json(
        { error: 'Failed to get job photos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ photos: data });
  } catch (error) {
    console.error('Error in job photos retrieval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();

    if (jobError) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const type = formData.get('type') as string;
    const caption = formData.get('caption') as string;

    if (!photo) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    if (!type || !['before', 'after', 'issue', 'other'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid photo type' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileExt = photo.name.split('.').pop();
    const fileName = `${jobId}/${type}_${timestamp}.${fileExt}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('job-photos')
      .upload(fileName, photo, {
        contentType: photo.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload photo' },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('job-photos')
      .getPublicUrl(uploadData.path);

    // Create a record in the job_photos table
    const { data: photoRecord, error: recordError } = await supabase
      .from('job_photos')
      .insert({
        job_id: jobId,
        uploaded_by: session.user.id,
        url: publicUrlData.publicUrl,
        type,
        caption: caption || null
      })
      .select()
      .single();

    if (recordError) {
      console.error('Error creating photo record:', recordError);
      return NextResponse.json(
        { error: 'Failed to create photo record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ photo: photoRecord });
  } catch (error) {
    console.error('Error in photo upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}