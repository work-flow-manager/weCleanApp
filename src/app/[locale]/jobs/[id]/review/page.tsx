import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ReviewForm } from '@/components/reviews/review-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Leave a Review | We-Clean.app',
  description: 'Share your experience and leave a review',
};

export default async function ReviewPage({ 
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
  
  // Fetch job data
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customers:customer_id (*),
      service_types:service_type_id (*)
    `)
    .eq('id', params.id)
    .single();
  
  // If job not found, show 404
  if (error || !job) {
    notFound();
  }
  
  // Check if user is the customer for this job
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();
  
  const isCustomer = job.customer_id === profile?.id || job.customers?.profile_id === user.id;
  
  // Only customers can leave reviews
  if (!isCustomer && profile?.role !== 'admin') {
    redirect(`/jobs/${params.id}`);
  }
  
  // Check if job is completed (only completed jobs can be reviewed)
  if (job.status !== 'completed') {
    redirect(`/jobs/${params.id}`);
  }
  
  // Check if user has already reviewed this job
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('job_id', params.id)
    .eq('customer_id', job.customer_id)
    .single();
  
  // If review already exists, redirect to job page
  if (existingReview) {
    redirect(`/jobs/${params.id}`);
  }
  
  // Get job title
  const jobTitle = job.title || `${job.service_types?.name || 'Service'} on ${new Date(job.scheduled_date).toLocaleDateString()}`;
  
  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <Suspense fallback={<ReviewFormSkeleton />}>
        <ReviewForm 
          jobId={params.id} 
          jobTitle={jobTitle}
        />
      </Suspense>
    </div>
  );
}

function ReviewFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full" />
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