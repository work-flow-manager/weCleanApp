import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { CreateReviewResponseRequest } from '@/types/review';

// POST /api/reviews/[id]/response - Respond to a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const reviewId = params.id;
    
    // Fetch the review
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, job_id, customer_id')
      .eq('id', reviewId)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    // Get user's profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    // Check if user is authorized to respond (admin or manager)
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only admins and managers can respond to reviews' }, { status: 403 });
    }
    
    // Check if review already has a response
    const { data: existingResponse, error: responseError } = await supabase
      .from('review_responses')
      .select('id')
      .eq('review_id', reviewId)
      .single();
      
    if (existingResponse) {
      return NextResponse.json({ error: 'This review already has a response' }, { status: 400 });
    }
    
    // Parse request body
    const requestData: CreateReviewResponseRequest = await request.json();
    
    // Validate required fields
    if (!requestData.response_text) {
      return NextResponse.json({ error: 'Response text is required' }, { status: 400 });
    }
    
    // Create the response
    const { data: response, error: createError } = await supabase
      .from('review_responses')
      .insert({
        review_id: reviewId,
        response_text: requestData.response_text,
        responded_by: user.id
      })
      .select()
      .single();
      
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    
    // Fetch the complete review with the new response
    const { data: completeReview, error: fetchCompleteError } = await supabase
      .from('reviews')
      .select(`
        *,
        customers:customer_id (*),
        jobs:job_id (*),
        response:review_responses (*)
      `)
      .eq('id', reviewId)
      .single();
      
    if (fetchCompleteError) {
      return NextResponse.json({ error: fetchCompleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ review: completeReview }, { status: 201 });
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}