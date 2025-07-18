import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/reports
 * Get report templates and saved reports
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'templates'; // 'templates' or 'saved'
    
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
    
    // Check if user has access to reports
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Get report templates or saved reports
    let data;
    if (type === 'templates') {
      const { data: templates, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch report templates' },
          { status: 500 }
        );
      }
      
      data = templates;
    } else {
      const { data: reports, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('generated_at', { ascending: false });
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch saved reports' },
          { status: 500 }
        );
      }
      
      data = reports;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports
 * Create a report template
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
    
    // Check if user has access to create reports
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create report template
    const { data, error } = await supabase
      .from('report_templates')
      .insert({
        business_id: profile.business_id,
        name: body.name,
        description: body.description,
        sections: body.sections,
        filters: body.filters || [],
        schedule: body.schedule,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create report template' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}