"use client"

import React, { useState, useEffect } from 'react';
import { ReviewStats } from '@/types/review';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface RatingSummaryProps {
  businessId?: string;
  jobId?: string;
  customerId?: string;
  className?: string;
}

export function RatingSummary({ 
  businessId, 
  jobId, 
  customerId,
  className 
}: RatingSummaryProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construct query parameters
        const params = new URLSearchParams();
        if (businessId) params.append('business_id', businessId);
        if (jobId) params.append('job_id', jobId);
        if (customerId) params.append('customer_id', customerId);
        
        // Fetch review stats from API
        const response = await fetch(`/api/reviews/stats?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch review statistics');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching review stats:', err);
        setError('Failed to load review statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviewStats();
  }, [businessId, jobId, customerId]);

  // Calculate the highest rating count for proper scaling
  const maxRatingCount = stats ? Math.max(
    stats.rating_distribution['1'],
    stats.rating_distribution['2'],
    stats.rating_distribution['3'],
    stats.rating_distribution['4'],
    stats.rating_distribution['5']
  ) : 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center justify-center">
              <Skeleton className="h-16 w-16 rounded-full mb-2" />
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex-1 space-y-3">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            {error}
          </div>
        ) : stats && stats.total_reviews > 0 ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Average Rating */}
            <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.average_rating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.average_rating)} readOnly size="md" />
              <p className="text-sm text-muted-foreground mt-2">
                Based on {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Rating Distribution */}
            <div className="flex-1 space-y-2 pt-4 md:pt-0">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.rating_distribution[rating.toString() as keyof typeof stats.rating_distribution];
                const percentage = stats.total_reviews > 0 
                  ? Math.round((count / stats.total_reviews) * 100) 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-8">
                      <span className="text-sm font-medium">{rating}</span>
                      <StarRating rating={1} maxRating={1} readOnly size="sm" />
                    </div>
                    <Progress 
                      value={maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0} 
                      className="h-2 flex-1" 
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
              
              {/* Response Rate */}
              <div className="pt-2 mt-2 border-t text-xs text-muted-foreground flex justify-between">
                <span>Response rate</span>
                <span className="font-medium">{Math.round(stats.response_rate * 100)}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}