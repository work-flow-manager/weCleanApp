import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { InvoiceStats } from '@/types/invoice';

// GET /api/invoices/stats - Get invoice statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    // Only admins and managers can view invoice stats
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Get user's company ID
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('profile_id', user.id)
      .single();
      
    if (companyError) {
      return NextResponse.json({ error: 'Failed to fetch company information' }, { status: 500 });
    }
    
    const companyId = companyMember.company_id;
    
    // Get query parameters for date filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Base query for all invoices in the company
    let query = supabase
      .from('invoices')
      .select('id, status, total_amount, paid_amount')
      .eq('company_id', companyId);
      
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('issue_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('issue_date', endDate);
    }
    
    // Execute query
    const { data: invoices, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Calculate statistics
    const stats: InvoiceStats = {
      total_invoices: invoices?.length || 0,
      total_amount: 0,
      paid_amount: 0,
      overdue_amount: 0,
      draft_amount: 0,
      sent_amount: 0
    };
    
    // Process each invoice
    invoices?.forEach(invoice => {
      stats.total_amount += invoice.total_amount;
      
      if (invoice.status === 'paid') {
        stats.paid_amount += invoice.total_amount;
      } else if (invoice.status === 'overdue') {
        stats.overdue_amount += invoice.total_amount;
      } else if (invoice.status === 'draft') {
        stats.draft_amount += invoice.total_amount;
      } else if (invoice.status === 'sent') {
        stats.sent_amount += invoice.total_amount;
      }
    });
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}