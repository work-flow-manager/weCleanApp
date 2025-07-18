import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// POST /api/invoices/[id]/send - Mark an invoice as sent
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
    
    // Only admins and managers can send invoices
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const invoiceId = params.id;
    
    // Check if invoice exists and get its status
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, customer_id')
      .eq('id', invoiceId)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    // Only draft invoices can be sent
    if (invoice.status !== 'draft') {
      return NextResponse.json({ 
        error: `Cannot send invoice with status '${invoice.status}'` 
      }, { status: 400 });
    }
    
    // Update the invoice status to sent
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single();
      
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Get customer information for notification
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, profile_id')
      .eq('id', invoice.customer_id)
      .single();
      
    if (!customerError && customer && customer.profile_id) {
      // Create a notification for the customer
      await supabase.from('notifications').insert({
        user_id: customer.profile_id,
        type: 'invoice_received',
        title: 'New Invoice Received',
        message: `You have received invoice #${updatedInvoice.invoice_number}`,
        is_read: false,
        related_id: invoiceId
      });
    }
    
    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}