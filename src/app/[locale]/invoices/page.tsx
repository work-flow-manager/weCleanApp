import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { InvoiceList } from '@/components/invoices/invoice-list';
import { InvoiceStats } from '@/components/invoices/invoice-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Invoices | We-Clean.app',
  description: 'Manage your invoices and payments',
};

export default async function InvoicesPage({ params }: { params: { locale: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch initial invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      customers:customer_id (*),
      jobs:job_id (*)
    `)
    .order('issue_date', { ascending: false })
    .limit(10);
  
  return (
    <div className="container py-6 space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Invoice List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <Suspense fallback={<InvoiceListSkeleton />}>
            <InvoiceList initialInvoices={invoices || []} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <Suspense fallback={<InvoiceStatsSkeleton />}>
            <InvoiceStats />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InvoiceListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function InvoiceStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}