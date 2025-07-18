import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PaymentReceipt } from '@/components/invoices/payment-receipt';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Payment Receipt | We-Clean.app',
  description: 'View and download payment receipt',
};

export default async function PaymentReceiptPage({ 
  params 
}: { 
  params: { locale: string; id: string; paymentId: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch invoice data
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      customers:customer_id (*),
      jobs:job_id (*)
    `)
    .eq('id', params.id)
    .single();
  
  // If invoice not found, show 404
  if (invoiceError || !invoice) {
    notFound();
  }
  
  // Fetch payment data
  const { data: payment, error: paymentError } = await supabase
    .from('invoice_payments')
    .select(`
      *,
      profiles:created_by (*)
    `)
    .eq('id', params.paymentId)
    .eq('invoice_id', params.id)
    .single();
  
  // If payment not found, show 404
  if (paymentError || !payment) {
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
      <Suspense fallback={<ReceiptSkeleton />}>
        <PaymentReceipt 
          payment={payment} 
          invoice={invoice} 
          company={company} 
        />
      </Suspense>
    </div>
  );
}

function ReceiptSkeleton() {
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