import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { InvoiceDetails } from '@/components/invoices/invoice-details';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Invoice Details | We-Clean.app',
  description: 'View and manage invoice details',
};

export default async function InvoiceDetailsPage({ 
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
      invoice_items:invoice_items (*),
      invoice_payments:invoice_payments (*)
    `)
    .eq('id', params.id)
    .single();
  
  // If invoice not found, show 404
  if (error || !invoice) {
    notFound();
  }
  
  return (
    <div className="container py-6">
      <Suspense fallback={<InvoiceDetailsSkeleton />}>
        <InvoiceDetails invoice={invoice} />
      </Suspense>
    </div>
  );
}

function InvoiceDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      
      <Skeleton className="h-96 w-full" />
    </div>
  );
}