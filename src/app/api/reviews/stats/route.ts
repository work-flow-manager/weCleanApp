import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { ReviewStats } from '@/types/review';

// GET /api/reviews/stats - Get review statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');
    const customerId = searchParams.get('customer_id');
    
    // Build base query
    let query = supabase.from('reviews').select('id, rating');
    
    // Apply filters
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    // Execute query
    const { data: reviews, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Calculate statistics
    const totalReviews = reviews?.length || 0;
    
    // Initialize rating distribution
    const ratingDistribution = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0
    };
    
    // Calculate average rating and distribution
    let sumRatings = 0;
    
    reviews?.forEach(review => {
      sumRatings += review.rating;
      ratingDistribution[review.rating.toString() as keyof typeof ratingDistribution]++;
    });
    
    const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;
    
    // Get response rate
    let responseQuery = supabase.from('review_responses').select('id');
    
    if (jobId) {
      responseQuery = responseQuery.eq('review.job_id', jobId);
    }
    
    if (customerId) {
      responseQuery = responseQuery.eq('review.customer_id', customerId);
    }
    
    const { data: responses, error: responseError } = await responseQuery;
    
    if (responseError) {
      return NextResponse.json({ error: responseError.message }, { status: 500 });
    }
    
    const responseRate = totalReviews > 0 ? (responses?.length || 0) / totalReviews : 0;
    
    // Compile stats
    const stats: ReviewStats = {
      total_reviews: totalReviews,
      average_rating: parseFloat(averageRating.toFixed(1)),
      rating_distribution: ratingDistribution,
      response_rate: parseFloat((responseRate * 100).toFixed(1))
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}