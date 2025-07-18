import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { UpdateReviewRequest, MAX_RATING, MIN_RATING, MAX_REVIEW_TEXT_LENGTH } from '@/types/review';

// GET /api/reviews/[id] - Get a specific review by ID
export async function GET(
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
    
    // Fetch the review with related data
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customers:customer_id (*),
        jobs:job_id (*),
        response:review_responses (*)
      `)
      .eq('id', reviewId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/reviews/[id] - Update a review
export async function PUT(
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
    
    // Fetch the review to check ownership
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, customer_id')
      .eq('id', reviewId)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    // Check if user is the customer or an admin
    const isCustomer = review.customer_id === profile.id;
    const isAdmin = profile.role === 'admin';
    
    if (!isCustomer && !isAdmin) {
      return NextResponse.json({ error: 'You can only update your own reviews' }, { status: 403 });
    }
    
    // Parse request body
    const requestData: UpdateReviewRequest = await request.json();
    
    // Validate rating if provided
    if (requestData.rating !== undefined && (requestData.rating < MIN_RATING || requestData.rating > MAX_RATING)) {
      return NextResponse.json({ 
        error: `Rating must be between ${MIN_RATING} and ${MAX_RATING}` 
      }, { status: 400 });
    }
    
    // Validate review text length if provided
    if (requestData.review_text && requestData.review_text.length > MAX_REVIEW_TEXT_LENGTH) {
      return NextResponse.json({ 
        error: `Review text cannot exceed ${MAX_REVIEW_TEXT_LENGTH} characters` 
      }, { status: 400 });
    }
    
    // Update the review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({
        rating: requestData.rating,
        review_text: requestData.review_text,
        photos: requestData.photos,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();
      
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Fetch the complete updated review with related data
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
    
    return NextResponse.json({ review: completeReview });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
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
    
    // Fetch the review to check ownership
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, customer_id')
      .eq('id', reviewId)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    // Check if user is the customer or an admin
    const isCustomer = review.customer_id === profile.id;
    const isAdmin = profile.role === 'admin';
    
    if (!isCustomer && !isAdmin) {
      return NextResponse.json({ error: 'You can only delete your own reviews' }, { status: 403 });
    }
    
    // Delete the review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
      
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}