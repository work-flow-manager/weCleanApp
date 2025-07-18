"use client"

import React from 'react';
import { BusinessOverviewAnalytics } from '@/types/analytics';
import { MetricCard } from './metric-card';
import { ChartCard } from './chart-card';
import { DollarSign, Calendar, Star, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BusinessOverviewProps {
  data?: BusinessOverviewAnalytics;
  isLoading?: boolean;
  className?: string;
}

export function BusinessOverview({ data, isLoading = false, className }: BusinessOverviewProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40 mt-3" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border rounded-lg p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="border rounded-lg p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className={className}>
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard 
          metric={data.total_revenue} 
          icon={<DollarSign className="h-5 w-5 text-primary" />} 
        />
        <MetricCard 
          metric={data.total_jobs} 
          icon={<Calendar className="h-5 w-5 text-primary" />} 
        />
        <MetricCard 
          metric={data.average_job_value} 
          icon={<TrendingUp className="h-5 w-5 text-primary" />} 
        />
        <MetricCard 
          metric={data.customer_satisfaction} 
          icon={<Star className="h-5 w-5 text-primary" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard 
          title="Revenue Over Time" 
          chartData={data.revenue_chart} 
          chartType="line" 
        />
        <ChartCard 
          title="Jobs Completed" 
          chartData={data.jobs_chart} 
          chartType="bar" 
        />
      </div>
    </div>
  );
}