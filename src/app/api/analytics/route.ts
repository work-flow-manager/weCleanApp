import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { AnalyticsFilters } from '@/types/analytics';

/**
 * GET /api/analytics
 * Get analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const teamMemberIds = searchParams.get('team_member_ids')?.split(',') || [];
    const serviceTypeIds = searchParams.get('service_type_ids')?.split(',') || [];
    const locationIds = searchParams.get('location_ids')?.split(',') || [];
    const customerIds = searchParams.get('customer_ids')?.split(',') || [];
    
    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user profile to get the business ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, business_id')
      .eq('auth_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to analytics
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Create filters object
    const filters: AnalyticsFilters = {
      timeframe: {
        start_date: startDate,
        end_date: endDate
      }
    };
    
    // Add optional filters
    if (teamMemberIds.length > 0 && teamMemberIds[0] !== '') {
      filters.team_member_ids = teamMemberIds;
    }
    
    if (serviceTypeIds.length > 0 && serviceTypeIds[0] !== '') {
      filters.service_type_ids = serviceTypeIds;
    }
    
    if (locationIds.length > 0 && locationIds[0] !== '') {
      filters.location_ids = locationIds;
    }
    
    if (customerIds.length > 0 && customerIds[0] !== '') {
      filters.customer_ids = customerIds;
    }
    
    // Get analytics data
    const analyticsData = await AnalyticsService.getAnalyticsData(
      profile.business_id,
      filters
    );
    
    if (!analyticsData) {
      return NextResponse.json(
        { error: 'Failed to retrieve analytics data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}