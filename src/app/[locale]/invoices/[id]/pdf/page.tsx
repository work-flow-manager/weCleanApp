import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { InvoicePdfViewer } from '@/components/invoices/invoice-pdf-viewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Invoice PDF | We-Clean.app',
  description: 'View and download invoice PDF',
};

export default async function InvoicePdfPage({ 
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
      invoice_items:invoice_items (
        *,
        service_types:service_type_id (*)
      ),
      invoice_payments:invoice_payments (*)
    `)
    .eq('id', params.id)
    .single();
  
  // If invoice not found, show 404
  if (error || !invoice) {
    notFound();
  }
  
  // Fetch company information
  const { data: company } = await supabase
    .from('companies')
    .select(`
      *,
      company_invoice_settings!company_id (*)
    `)
    .eq('id', invoice.company_id)
    .single();
  
  if (!company) {
    notFound();
  }
  
  return (
    <div className="container py-6">
      <Suspense fallback={<PdfViewerSkeleton />}>
        <InvoicePdfViewer invoice={invoice} companyInfo={company} />
      </Suspense>
    </div>
  );
}

function PdfViewerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <Skeleton className="h-[800px] w-full" />
    </div>
  );
}