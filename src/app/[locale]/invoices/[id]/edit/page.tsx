import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Edit Invoice | We-Clean.app',
  description: 'Edit an existing invoice',
};

export default async function EditInvoicePage({ 
  params 
}: { 
  params: { locale: string; id: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch invoice data
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers:customer_id (*),
      jobs:job_id (*),
      invoice_items:invoice_items (*)
    `)
    .eq('id', params.id)
    .single();
  
  // If invoice not found or not in draft status, show 404
  if (error || !invoice || invoice.status !== 'draft') {
    notFound();
  }
  
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
          initialData={{ invoice }}
          customers={customers || []}
          serviceTypes={serviceTypes || []}
          isEditing={true}
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