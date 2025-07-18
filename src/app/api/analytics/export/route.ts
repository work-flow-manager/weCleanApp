import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { AnalyticsFilters, ExportOptions } from '@/types/analytics';

/**
 * POST /api/analytics/export
 * Export analytics data
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
    
    // Parse request body
    const { filters, options } = await request.json();
    
    // Validate required parameters
    if (!filters?.timeframe?.start_date || !filters?.timeframe?.end_date) {
      return NextResponse.json(
        { error: 'start_date and end_date are required in timeframe' },
        { status: 400 }
      );
    }
    
    if (!options?.format || !options?.sections) {
      return NextResponse.json(
        { error: 'format and sections are required in options' },
        { status: 400 }
      );
    }
    
    // Generate export file
    // In a real implementation, this would generate the file and store it
    // For now, we'll just return a mock download URL
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `analytics_export_${timestamp}.${options.format}`;
    
    // In a real implementation, we would store the file in Supabase Storage
    // and return a signed URL for download
    const downloadUrl = `/api/downloads/${filename}`;
    
    return NextResponse.json({
      success: true,
      downloadUrl,
      filename,
      format: options.format,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/analytics/export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}