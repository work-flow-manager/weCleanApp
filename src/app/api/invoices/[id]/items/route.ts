import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// GET /api/invoices/[id]/items - Get all items for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const invoiceId = params.id;
    
    // Fetch the invoice items
    const { data: items, error } = await supabase
      .from('invoice_items')
      .select(`
        *,
        service_types:service_type_id (*)
      `)
      .eq('invoice_id', invoiceId);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching invoice items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices/[id]/items - Add a new item to an invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Only admins and managers can add invoice items
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const invoiceId = params.id;
    
    // Check if invoice exists and get its status
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, tax_rate')
      .eq('id', invoiceId)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    // Prevent adding items to paid or cancelled invoices
    if (['paid', 'cancelled'].includes(invoice.status)) {
      return NextResponse.json({ 
        error: 'Cannot add items to paid or cancelled invoices' 
      }, { status: 400 });
    }
    
    // Parse request body
    const requestData = await request.json();
    
    // Validate required fields
    if (!requestData.description || !requestData.quantity || !requestData.unit_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Calculate amount and tax
    const amount = requestData.quantity * requestData.unit_price;
    const taxRate = requestData.tax_rate !== undefined ? requestData.tax_rate : invoice.tax_rate;
    const taxAmount = amount * (taxRate / 100);
    
    // Add the new item
    const { data: item, error: insertError } = await supabase
      .from('invoice_items')
      .insert({
        invoice_id: invoiceId,
        description: requestData.description,
        quantity: requestData.quantity,
        unit_price: requestData.unit_price,
        amount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        service_type_id: requestData.service_type_id
      })
      .select()
      .single();
      
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error adding invoice item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}