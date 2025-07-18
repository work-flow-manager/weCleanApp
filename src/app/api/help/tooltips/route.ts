import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GetHelpTooltipsRequest, HelpTooltip } from '@/types/help';

/**
 * POST /api/help/tooltips
 * Get help tooltips for a page
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body: GetHelpTooltipsRequest = await request.json();
    
    // Validate required fields
    if (!body.page) {
      return NextResponse.json(
        { error: 'Page is required' },
        { status: 400 }
      );
    }
    
    // Get user profile to get the role
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
    
    // In a real implementation, this would query a database of tooltips
    // For now, we'll simulate with mock data
    
    // Get all tooltips
    const { data: tooltips, error } = await supabase
      .from('help_tooltips')
      .select('*');
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch help tooltips' },
        { status: 500 }
      );
    }
    
    // Filter tooltips by page, section, and role
    const { page, section } = body;
    const role = profile.role;
    
    const filteredTooltips = tooltips.filter((tooltip: any) => {
      // Check if tooltip is relevant to the user's role
      if (tooltip.roles && !tooltip.roles.includes(role)) {
        return false;
      }
      
      // Check if tooltip matches the page
      if (tooltip.page !== page) {
        return false;
      }
      
      // Check if tooltip matches the section if provided
      if (section && tooltip.section && tooltip.section !== section) {
        return false;
      }
      
      return true;
    });
    
    // Check if tooltips have been viewed by the user
    const { data: viewedTooltips } = await supabase
      .from('user_viewed_tooltips')
      .select('tooltip_id')
      .eq('user_id', user.id);
    
    const viewedTooltipIds = viewedTooltips?.map((vt: any) => vt.tooltip_id) || [];
    
    // Filter out tooltips that should only be shown once and have been viewed
    const finalTooltips = filteredTooltips.filter((tooltip: any) => {
      if (tooltip.showOnce && viewedTooltipIds.includes(tooltip.id)) {
        return false;
      }
      return true;
    });
    
    return NextResponse.json({
      tooltips: finalTooltips
    });
  } catch (error) {
    console.error('Error in POST /api/help/tooltips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}