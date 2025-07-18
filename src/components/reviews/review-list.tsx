"use client"

import React, { useState, useEffect } from 'react';
import { Review, ReviewFilters, ReviewListResponse } from '@/types/review';
import { ReviewCard } from './review-card';
import { ReviewResponseDialog } from './review-response-dialog';
import { ReviewFilterBar } from './review-filter-bar';
import { RatingSummary } from './rating-summary';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertCircle } from 'lucide-react';

interface ReviewListProps {
  businessId?: string;
  jobId?: string;
  customerId?: string;
  limit?: number;
  showFilters?: boolean;
  showRatingSummary?: boolean;
  allowResponses?: boolean;
  emptyMessage?: string;
}

export function ReviewList({
  businessId,
  jobId,
  customerId,
  limit = 10,
  showFilters = true,
  showRatingSummary = true,
  allowResponses = false,
  emptyMessage = "No reviews found"
}: ReviewListProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({
    job_id: jobId,
    customer_id: customerId,
  });

  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;

  // Fetch reviews based on filters and pagination
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construct query parameters
        const params = new URLSearchParams();
        if (businessId) params.append('business_id', businessId);
        if (filters.job_id) params.append('job_id', filters.job_id);
        if (filters.customer_id) params.append('customer_id', filters.customer_id);
        if (filters.min_rating) params.append('min_rating', filters.min_rating.toString());
        if (filters.max_rating) params.append('max_rating', filters.max_rating.toString());
        if (filters.has_response !== undefined) params.append('has_response', filters.has_response.toString());
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        
        // Fetch reviews from API
        const response = await fetch(`/api/reviews?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data: ReviewListResponse = await response.json();
        setReviews(data.reviews);
        setTotalReviews(data.total);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [businessId, filters, limit, offset]);

  // Handle filter changes
  const handleFilterChange = (newFilters: ReviewFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle review response
  const handleReviewResponse = (reviewId: string) => {
    setSelectedReviewId(reviewId);
  };

  // Handle response submission
  const handleResponseSubmit = async (reviewId: string, responseText: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response_text: responseText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      // Update the review in the list with the new response
      const updatedReview = await response.json();
      setReviews(reviews.map(review => 
        review.id === reviewId ? updatedReview.review : review
      ));
      
      toast({
        title: "Response submitted",
        description: "Your response has been added to the review.",
      });
      
      // Close the response dialog
      setSelectedReviewId(null);
    } catch (err) {
      console.error('Error submitting response:', err);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Find the selected review for the response dialog
  const selectedReview = selectedReviewId 
    ? reviews.find(review => review.id === selectedReviewId)
    : null;

  // Calculate total pages
  const totalPages = Math.ceil(totalReviews / limit);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {showRatingSummary && (
        <RatingSummary 
          businessId={businessId} 
          jobId={jobId} 
          customerId={customerId}
        />
      )}
      
      {/* Filters */}
      {showFilters && (
        <ReviewFilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      )}
      
      {/* Error State */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={() => setLoading(true)}
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-md border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && reviews.length === 0 && (
        <EmptyState 
          title="No reviews found"
          description={emptyMessage}
          icon="star"
        />
      )}
      
      {/* Review List */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review}
              showJobDetails={!jobId}
              onReply={allowResponses ? handleReviewResponse : undefined}
            />
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Response Dialog */}
      {selectedReview && (
        <ReviewResponseDialog
          review={selectedReview}
          open={!!selectedReviewId}
          onClose={() => setSelectedReviewId(null)}
          onSubmit={(responseText) => handleResponseSubmit(selectedReview.id, responseText)}
        />
      )}
    </div>
  );
}