import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  CreateReviewRequest, 
  ReviewFilters, 
  MAX_RATING, 
  MIN_RATING, 
  MAX_REVIEW_TEXT_LENGTH 
} from '@/types/review';

// GET /api/reviews - Get list of reviews with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const filters: ReviewFilters = {
      job_id: searchParams.get('job_id') || undefined,
      customer_id: searchParams.get('customer_id') || undefined,
      min_rating: searchParams.get('min_rating') ? parseInt(searchParams.get('min_rating')!) : undefined,
      max_rating: searchParams.get('max_rating') ? parseInt(searchParams.get('max_rating')!) : undefined,
      has_response: searchParams.get('has_response') ? searchParams.get('has_response') === 'true' : undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };
    
    // Pagination parameters
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get user's role and company ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    // Build query
    let query = supabase.from('job_reviews').select(`
      *,
      customers:customer_id (*),
      jobs:job_id (*),
      response:review_responses (*)
    `, { count: 'exact' });
    
    // Apply filters
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    
    if (filters.min_rating) {
      query = query.gte('rating', filters.min_rating);
    }
    
    if (filters.max_rating) {
      query = query.lte('rating', filters.max_rating);
    }
    
    if (filters.has_response !== undefined) {
      if (filters.has_response) {
        query = query.not('response', 'is', null);
      } else {
        query = query.is('response', null);
      }
    }
    
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Execute query
    const { data: reviews, error, count } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      reviews: reviews || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const requestData: CreateReviewRequest = await request.json();
    
    // Validate required fields
    if (!requestData.job_id || !requestData.rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate rating
    if (requestData.rating < MIN_RATING || requestData.rating > MAX_RATING) {
      return NextResponse.json({ 
        error: `Rating must be between ${MIN_RATING} and ${MAX_RATING}` 
      }, { status: 400 });
    }
    
    // Validate review text length
    if (requestData.review_text && requestData.review_text.length > MAX_REVIEW_TEXT_LENGTH) {
      return NextResponse.json({ 
        error: `Review text cannot exceed ${MAX_REVIEW_TEXT_LENGTH} characters` 
      }, { status: 400 });
    }
    
    // Fetch job to get customer ID
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('customer_id, status')
      .eq('id', requestData.job_id)
      .single();
      
    if (jobError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if job is completed
    if (job.status !== 'completed') {
      return NextResponse.json({ error: 'Cannot review a job that is not completed' }, { status: 400 });
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
    const isCustomer = job.customer_id === profile.id;
    const isAdmin = profile.role === 'admin';
    
    if (!isCustomer && !isAdmin) {
      return NextResponse.json({ error: 'Only the customer can review this job' }, { status: 403 });
    }
    
    // Check if user has already reviewed this job
    const { data: existingReview, error: reviewError } = await supabase
      .from('job_reviews')
      .select('id')
      .eq('job_id', requestData.job_id)
      .eq('customer_id', job.customer_id)
      .single();
      
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this job' }, { status: 400 });
    }
    
    // Create the review
    const { data: review, error: createError } = await supabase
      .from('job_reviews')
      .insert({
        job_id: requestData.job_id,
        customer_id: job.customer_id,
        rating: requestData.rating,
        review_text: requestData.review_text,
        photos: requestData.photos
      })
      .select()
      .single();
      
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    
    // Fetch the complete review with related data
    const { data: completeReview, error: fetchError } = await supabase
      .from('job_reviews')
      .select(`
        *,
        customers:customer_id (*),
        jobs:job_id (*)
      `)
      .eq('id', review.id)
      .single();
      
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    return NextResponse.json({ review: completeReview }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}