import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { PaymentForm } from '@/components/invoices/payment-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Make Payment | We-Clean.app',
  description: 'Process payment for your invoice',
};

export default async function PaymentPage({ 
  params 
}: { 
  params: { locale: string; id: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
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
  
  // Check if invoice is already paid or cancelled
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    redirect(`/invoices/${params.id}`);
  }
  
  // Check if user has permission to pay this invoice
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();
  
  // Only admins, managers, and the customer can pay invoices
  const isCustomer = invoice.customers?.profile_id === user.id;
  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'manager';
  
  if (!isCustomer && !isAdminOrManager) {
    redirect(`/invoices/${params.id}`);
  }
  
  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <Suspense fallback={<PaymentFormSkeleton />}>
        <PaymentForm invoice={invoice} />
      </Suspense>
    </div>
  );
}

function PaymentFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}