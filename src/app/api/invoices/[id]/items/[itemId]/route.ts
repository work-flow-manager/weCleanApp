import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// PUT /api/invoices/[id]/items/[itemId] - Update an invoice item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    
    // Only admins and managers can update invoice items
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const invoiceId = params.id;
    const itemId = params.itemId;
    
    // Check if invoice exists and get its status
    const { data: invoice, error: fetchInvoiceError } = await supabase
      .from('invoices')
      .select('id, status, tax_rate')
      .eq('id', invoiceId)
      .single();
      
    if (fetchInvoiceError) {
      if (fetchInvoiceError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchInvoiceError.message }, { status: 500 });
    }
    
    // Prevent updating items for paid or cancelled invoices
    if (['paid', 'cancelled'].includes(invoice.status)) {
      return NextResponse.json({ 
        error: 'Cannot update items for paid or cancelled invoices' 
      }, { status: 400 });
    }
    
    // Check if item exists and belongs to the invoice
    const { data: existingItem, error: fetchItemError } = await supabase
      .from('invoice_items')
      .select('id')
      .eq('id', itemId)
      .eq('invoice_id', invoiceId)
      .single();
      
    if (fetchItemError) {
      if (fetchItemError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchItemError.message }, { status: 500 });
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
    
    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from('invoice_items')
      .update({
        description: requestData.description,
        quantity: requestData.quantity,
        unit_price: requestData.unit_price,
        amount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        service_type_id: requestData.service_type_id
      })
      .eq('id', itemId)
      .select()
      .single();
      
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('Error updating invoice item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invoices/[id]/items/[itemId] - Delete an invoice item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    
    // Only admins and managers can delete invoice items
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const invoiceId = params.id;
    const itemId = params.itemId;
    
    // Check if invoice exists and get its status
    const { data: invoice, error: fetchInvoiceError } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .single();
      
    if (fetchInvoiceError) {
      if (fetchInvoiceError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchInvoiceError.message }, { status: 500 });
    }
    
    // Prevent deleting items from paid or cancelled invoices
    if (['paid', 'cancelled'].includes(invoice.status)) {
      return NextResponse.json({ 
        error: 'Cannot delete items from paid or cancelled invoices' 
      }, { status: 400 });
    }
    
    // Check if item exists and belongs to the invoice
    const { data: existingItem, error: fetchItemError } = await supabase
      .from('invoice_items')
      .select('id')
      .eq('id', itemId)
      .eq('invoice_id', invoiceId)
      .single();
      
    if (fetchItemError) {
      if (fetchItemError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchItemError.message }, { status: 500 });
    }
    
    // Delete the item
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', itemId);
      
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}