import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// GET /api/invoices/settings - Get invoice settings for the company
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Fetch invoice settings
    const { data: settings, error } = await supabase
      .from('company_invoice_settings')
      .select('*')
      .eq('company_id', companyId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // If settings don't exist, return default values
    if (!settings) {
      return NextResponse.json({
        settings: {
          company_id: companyId,
          default_tax_rate: 0,
          default_payment_terms: 'Due within 30 days',
          invoice_prefix: '',
          invoice_footer: '',
          next_invoice_number: 1,
          logo_url: null
        }
      });
    }
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invoices/settings - Update invoice settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's role and company ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
    
    // Only admins can update invoice settings
    if (profile.role !== 'admin') {
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
    
    // Parse request body
    const requestData = await request.json();
    
    // Check if settings exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from('company_invoice_settings')
      .select('company_id')
      .eq('company_id', companyId)
      .single();
      
    let updatedSettings;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // Settings don't exist, create new
      const { data: newSettings, error: insertError } = await supabase
        .from('company_invoice_settings')
        .insert({
          company_id: companyId,
          default_tax_rate: requestData.default_tax_rate || 0,
          default_payment_terms: requestData.default_payment_terms,
          invoice_prefix: requestData.invoice_prefix,
          invoice_footer: requestData.invoice_footer,
          next_invoice_number: requestData.next_invoice_number || 1,
          logo_url: requestData.logo_url
        })
        .select()
        .single();
        
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      
      updatedSettings = newSettings;
    } else {
      // Settings exist, update
      const { data: settings, error: updateError } = await supabase
        .from('company_invoice_settings')
        .update({
          default_tax_rate: requestData.default_tax_rate,
          default_payment_terms: requestData.default_payment_terms,
          invoice_prefix: requestData.invoice_prefix,
          invoice_footer: requestData.invoice_footer,
          next_invoice_number: requestData.next_invoice_number,
          logo_url: requestData.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId)
        .select()
        .single();
        
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      
      updatedSettings = settings;
    }
    
    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error('Error updating invoice settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}