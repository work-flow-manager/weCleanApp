import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// DELETE /api/invoices/[id]/payments/[paymentId] - Delete an invoice payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
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
    
    // Only admins can delete payments
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const invoiceId = params.id;
    const paymentId = params.paymentId;
    
    // Check if invoice exists
    const { data: invoice, error: fetchInvoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .single();
      
    if (fetchInvoiceError) {
      if (fetchInvoiceError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchInvoiceError.message }, { status: 500 });
    }
    
    // Check if payment exists and belongs to the invoice
    const { data: existingPayment, error: fetchPaymentError } = await supabase
      .from('invoice_payments')
      .select('id')
      .eq('id', paymentId)
      .eq('invoice_id', invoiceId)
      .single();
      
    if (fetchPaymentError) {
      if (fetchPaymentError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchPaymentError.message }, { status: 500 });
    }
    
    // Delete the payment
    const { error: deleteError } = await supabase
      .from('invoice_payments')
      .delete()
      .eq('id', paymentId);
      
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
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
      success: true,
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Error deleting invoice payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}