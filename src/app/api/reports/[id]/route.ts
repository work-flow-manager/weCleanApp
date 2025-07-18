import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/reports/[id]
 * Get a report template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
    
    // Get report template
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .eq('business_id', profile.business_id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in GET /api/reports/[id]:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reports/[id]
 * Update a report template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
    
    // Check if user has access to update reports
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Check if the report template exists and belongs to the user's business
    const { data: template, error: templateError } = await supabase
      .from('report_templates')
      .select('id')
      .eq('id', id)
      .eq('business_id', profile.business_id)
      .single();
    
    if (templateError) {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.sections !== undefined) updateData.sections = body.sections;
    if (body.filters !== undefined) updateData.filters = body.filters;
    if (body.schedule !== undefined) updateData.schedule = body.schedule;
    
    // Update report template
    const { data, error } = await supabase
      .from('report_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update report template' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in PATCH /api/reports/[id]:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]
 * Delete a report template or saved report
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'template'; // 'template' or 'saved'
    
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
    
    // Check if user has access to delete reports
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Delete report template or saved report
    let error;
    if (type === 'template') {
      // Check if the report template exists and belongs to the user's business
      const { data: template, error: templateError } = await supabase
        .from('report_templates')
        .select('id')
        .eq('id', id)
        .eq('business_id', profile.business_id)
        .single();
      
      if (templateError) {
        return NextResponse.json(
          { error: 'Report template not found' },
          { status: 404 }
        );
      }
      
      // Delete report template
      const { error: deleteError } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);
      
      error = deleteError;
    } else {
      // Check if the saved report exists and belongs to the user's business
      const { data: report, error: reportError } = await supabase
        .from('saved_reports')
        .select('id')
        .eq('id', id)
        .eq('business_id', profile.business_id)
        .single();
      
      if (reportError) {
        return NextResponse.json(
          { error: 'Saved report not found' },
          { status: 404 }
        );
      }
      
      // Delete saved report
      const { error: deleteError } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', id);
      
      error = deleteError;
    }
    
    if (error) {
      return NextResponse.json(
        { error: `Failed to delete ${type}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/reports/[id]:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}