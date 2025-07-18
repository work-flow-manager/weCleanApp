import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { HelpTour } from '@/types/help';

/**
 * GET /api/help/tours/[pageId]
 * Get help tour for a page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const pageId = params.pageId;
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user profile to get the role if not provided
    let userRole = role;
    if (!userRole) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_id', user.id)
        .single();
      
      if (!profile) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }
      
      userRole = profile.role;
    }
    
    // In a real implementation, this would query a database of tours
    // For now, we'll simulate with mock data
    
    // Get all tours
    const { data: tours, error } = await supabase
      .from('help_tours')
      .select('*');
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch help tours' },
        { status: 500 }
      );
    }
    
    // Find the tour for the page and role
    const tour = tours.find((t: any) => {
      // Check if tour is for the requested page
      if (t.pageId !== pageId) {
        return false;
      }
      
      // Check if tour is relevant to the user's role
      if (t.role && !t.role.includes(userRole)) {
        return false;
      }
      
      return true;
    });
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Check if the tour has been completed by the user
    const { data: completedTours } = await supabase
      .from('user_completed_tours')
      .select('tour_id')
      .eq('user_id', user.id)
      .eq('tour_id', tour.id);
    
    const isCompleted = completedTours && completedTours.length > 0;
    
    // If the tour should only be shown on first visit and has been completed, return null
    if (tour.showOnFirstVisit && isCompleted) {
      return NextResponse.json({
        tour: null
      });
    }
    
    return NextResponse.json({
      tour
    });
  } catch (error) {
    console.error(`Error in GET /api/help/tours/[pageId]:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}