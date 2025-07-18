import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/reports/generate
 * Generate a report
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
    
    // Check if user has access to generate reports
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // If template_id is provided, get the template
    let template = null;
    if (body.template_id) {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', body.template_id)
        .eq('business_id', profile.business_id)
        .single();
      
      if (error) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      
      template = data;
    }
    
    // In a real implementation, this would generate the report
    // For now, we'll simulate a successful report generation
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `report_${timestamp}.${body.format}`;
    
    // In a real implementation, we would store the file in Supabase Storage
    // and return a signed URL for download
    const reportUrl = `/api/downloads/${filename}`;
    
    // Save the report metadata
    const { data: savedReport, error } = await supabase
      .from('saved_reports')
      .insert({
        business_id: profile.business_id,
        name: body.name,
        description: body.description || (template?.description || ''),
        format: body.format,
        url: reportUrl,
        size: Math.floor(Math.random() * 1000000) + 100000, // Random file size between 100KB and 1MB
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to save report metadata' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(savedReport);
  } catch (error) {
    console.error('Error in POST /api/reports/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}