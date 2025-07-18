import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Create Invoice | We-Clean.app',
  description: 'Create a new invoice',
};

export default async function NewInvoicePage({ 
  params,
  searchParams
}: { 
  params: { locale: string };
  searchParams: { customer_id?: string; job_id?: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Get customer ID and job ID from query params
  const customerId = searchParams.customer_id;
  const jobId = searchParams.job_id;
  
  // Fetch customers
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      profiles:profile_id (*)
    `)
    .order('business_name', { ascending: true });
  
  // Fetch service types
  const { data: serviceTypes } = await supabase
    .from('service_types')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  return (
    <div className="container py-6">
      <Suspense fallback={<InvoiceFormSkeleton />}>
        <InvoiceForm 
          initialData={{ customerId, jobId }}
          customers={customers || []}
          serviceTypes={serviceTypes || []}
        />
      </Suspense>
    </div>
  );
}

function InvoiceFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      
      <Skeleton className="h-96 w-full" />
    </div>
  );
}