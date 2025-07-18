import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { InvoiceSettingsForm } from '@/components/invoices/invoice-settings-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Invoice Settings | We-Clean.app',
  description: 'Configure invoice settings for your business',
};

export default async function InvoiceSettingsPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is authenticated and is an admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // Get user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  // Only admins can access settings
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }
  
  // Get user's company ID
  const { data: companyMember } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('profile_id', user.id)
    .single();
  
  if (!companyMember) {
    redirect('/dashboard');
  }
  
  // Fetch invoice settings
  const { data: settings } = await supabase
    .from('company_invoice_settings')
    .select('*')
    .eq('company_id', companyMember.company_id)
    .single();
  
  // Fetch company info
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyMember.company_id)
    .single();
  
  return (
    <div className="container py-6">
      <Suspense fallback={<SettingsSkeleton />}>
        <InvoiceSettingsForm 
          initialSettings={settings || {
            company_id: companyMember.company_id,
            default_tax_rate: 0,
            default_payment_terms: 'Due within 30 days',
            invoice_prefix: '',
            invoice_footer: '',
            next_invoice_number: 1
          }}
          company={company}
        />
      </Suspense>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      
      <Skeleton className="h-40 w-full" />
      
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}