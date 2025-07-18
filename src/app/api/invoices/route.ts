import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { 
  CreateInvoiceRequest, 
  InvoiceFilters, 
  InvoiceListResponse 
} from '@/types/invoice';

// GET /api/invoices - Get list of invoices with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const filters: InvoiceFilters = {
      status: searchParams.get('status') as any || undefined,
      customer_id: searchParams.get('customer_id') || undefined,
      job_id: searchParams.get('job_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      min_amount: searchParams.get('min_amount') ? parseFloat(searchParams.get('min_amount')!) : undefined,
      max_amount: searchParams.get('max_amount') ? parseFloat(searchParams.get('max_amount')!) : undefined,
    };
    
    // Pagination parameters
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get user's company ID and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    let query = supabase.from('invoices').select(`
      *,
      customers:customer_id (*),
      jobs:job_id (*),
      invoice_items:invoice_items (*)
    `, { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    
    if (filters.start_date) {
      query = query.gte('issue_date', filters.start_date);
    }
    
    if (filters.end_date) {
      query = query.lte('issue_date', filters.end_date);
    }
    
    if (filters.min_amount) {
      query = query.gte('total_amount', filters.min_amount);
    }
    
    if (filters.max_amount) {
      query = query.lte('total_amount', filters.max_amount);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Order by issue date (newest first)
    query = query.order('issue_date', { ascending: false });
    
    // Execute query
    const { data: invoices, error, count } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const response: InvoiceListResponse = {
      invoices: invoices || [],
      total: count || 0,
      limit,
      offset
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's company ID and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    // Only admins and managers can create invoices
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Get company ID for the user
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('profile_id', user.id)
      .single();
      
    if (companyError) {
      return NextResponse.json({ error: 'Failed to fetch company information' }, { status: 500 });
    }
    
    const companyId = companyMember.company_id;
    
    // Parse request body
    const requestData: CreateInvoiceRequest = await request.json();
    
    // Validate required fields
    if (!requestData.customer_id || !requestData.items || requestData.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Set default dates if not provided
    const today = new Date();
    const issueDate = requestData.issue_date || today.toISOString().split('T')[0];
    
    // Default due date is 30 days from issue date if not provided
    let dueDate = requestData.due_date;
    if (!dueDate) {
      const dueDateTime = new Date(issueDate);
      dueDateTime.setDate(dueDateTime.getDate() + 30);
      dueDate = dueDateTime.toISOString().split('T')[0];
    }
    
    // Get company's default tax rate if not provided
    let taxRate = requestData.tax_rate;
    if (taxRate === undefined) {
      const { data: settings } = await supabase
        .from('company_invoice_settings')
        .select('default_tax_rate')
        .eq('company_id', companyId)
        .single();
        
      taxRate = settings?.default_tax_rate || 0;
    }
    
    // Calculate initial subtotal (will be recalculated by trigger)
    const subtotal = requestData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
    
    // Calculate initial tax amount (will be recalculated by trigger)
    const taxAmount = subtotal * (taxRate / 100);
    
    // Calculate initial total amount (will be recalculated by trigger)
    const totalAmount = subtotal + taxAmount;
    
    // Start a transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: companyId,
        customer_id: requestData.customer_id,
        job_id: requestData.job_id,
        invoice_number: '', // Will be generated by trigger
        issue_date: issueDate,
        due_date: dueDate,
        subtotal,
        tax_amount: taxAmount,
        tax_rate: taxRate,
        total_amount: totalAmount,
        status: 'draft',
        notes: requestData.notes,
        payment_terms: requestData.payment_terms
      })
      .select()
      .single();
      
    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }
    
    // Insert invoice items
    const invoiceItems = requestData.items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      tax_rate: item.tax_rate || taxRate,
      tax_amount: (item.quantity * item.unit_price) * ((item.tax_rate || taxRate) / 100),
      service_type_id: item.service_type_id
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);
      
    if (itemsError) {
      // If there's an error with items, delete the invoice
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
    
    // Fetch the complete invoice with items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        customers:customer_id (*),
        jobs:job_id (*),
        invoice_items:invoice_items (*)
      `)
      .eq('id', invoice.id)
      .single();
      
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    return NextResponse.json({ invoice: completeInvoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}