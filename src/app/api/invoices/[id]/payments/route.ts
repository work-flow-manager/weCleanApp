import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { CreateInvoicePaymentRequest } from '@/types/invoice';

// GET /api/invoices/[id]/payments - Get all payments for an invoice
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
    
    // Fetch the invoice payments
    const { data: payments, error } = await supabase
      .from('invoice_payments')
      .select(`
        *,
        profiles:created_by (*)
      `)
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching invoice payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices/[id]/payments - Add a new payment to an invoice
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
    
    // Only admins and managers can add payments
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const invoiceId = params.id;
    
    // Check if invoice exists and get its status
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, total_amount, paid_amount')
      .eq('id', invoiceId)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    // Prevent adding payments to cancelled invoices
    if (invoice.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot add payments to cancelled invoices' 
      }, { status: 400 });
    }
    
    // Parse request body
    const requestData: CreateInvoicePaymentRequest = await request.json();
    
    // Validate required fields
    if (!requestData.amount || !requestData.payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate payment amount
    const remainingAmount = invoice.total_amount - (invoice.paid_amount || 0);
    if (requestData.amount > remainingAmount) {
      return NextResponse.json({ 
        error: 'Payment amount exceeds remaining balance',
        remainingAmount
      }, { status: 400 });
    }
    
    // Set default payment date if not provided
    const paymentDate = requestData.payment_date || new Date().toISOString();
    
    // Add the payment
    const { data: payment, error: insertError } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        amount: requestData.amount,
        payment_date: paymentDate,
        payment_method: requestData.payment_method,
        transaction_id: requestData.transaction_id,
        notes: requestData.notes,
        created_by: user.id
      })
      .select()
      .single();
      
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    // Fetch the updated invoice
    const { data: updatedInvoice, error: fetchUpdatedError } = await supabase
      .from('invoices')
      .select('id, status, total_amount, paid_amount, paid_date')
      .eq('id', invoiceId)
      .single();
      
    if (fetchUpdatedError) {
      return NextResponse.json({ error: fetchUpdatedError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      payment, 
      invoice: updatedInvoice 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding invoice payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}