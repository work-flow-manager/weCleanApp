import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Review, 
  CreateReviewRequest, 
  UpdateReviewRequest, 
  CreateReviewResponseRequest, 
  ReviewFilters 
} from '@/types/review';

/**
 * Custom hook for managing reviews
 */
export function useReviews() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Fetch a list of reviews with optional filtering
   */
  const fetchReviews = useCallback(async (filters?: ReviewFilters, limit = 10, offset = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.job_id) params.append('job_id', filters.job_id);
      if (filters?.customer_id) params.append('customer_id', filters.customer_id);
      if (filters?.min_rating) params.append('min_rating', filters.min_rating.toString());
      if (filters?.max_rating) params.append('max_rating', filters.max_rating.toString());
      if (filters?.has_response !== undefined) params.append('has_response', filters.has_response.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      const response = await fetch(`/api/reviews?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reviews');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch reviews', {
        description: errorMessage
      });
      return { reviews: [], total: 0, limit, offset };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single review by ID
   */
  const fetchReview = useCallback(async (reviewId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch review');
      }
      
      const data = await response.json();
      return data.review;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch review', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new review
   */
  const createReview = useCallback(async (reviewData: CreateReviewRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create review');
      }
      
      const data = await response.json();
      toast.success('Review submitted successfully');
      return data.review;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to submit review', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing review
   */
  const updateReview = useCallback(async (reviewId: string, reviewData: UpdateReviewRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review');
      }
      
      const data = await response.json();
      toast.success('Review updated successfully');
      return data.review;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to update review', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a review
   */
  const deleteReview = useCallback(async (reviewId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }
      
      toast.success('Review deleted successfully');
      router.refresh();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to delete review', {
        description: errorMessage
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Respond to a review
   */
  const respondToReview = useCallback(async (reviewId: string, responseData: CreateReviewResponseRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to respond to review');
      }
      
      const data = await response.json();
      toast.success('Response submitted successfully');
      return data.review;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to respond to review', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch review statistics
   */
  const fetchReviewStats = useCallback(async (filters?: { job_id?: string; customer_id?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.job_id) params.append('job_id', filters.job_id);
      if (filters?.customer_id) params.append('customer_id', filters.customer_id);
      
      const response = await fetch(`/api/reviews/stats?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch review statistics');
      }
      
      const data = await response.json();
      return data.stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch review statistics', {
        description: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload review photos
   */
  const uploadReviewPhotos = useCallback(async (files: File[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would upload to a storage service
      // For now, we'll just simulate a successful upload with local URLs
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create object URLs for the files
      const urls = files.map(file => URL.createObjectURL(file));
      
      return urls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to upload photos', {
        description: errorMessage
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchReviews,
    fetchReview,
    createReview,
    updateReview,
    deleteReview,
    respondToReview,
    fetchReviewStats,
    uploadReviewPhotos
  };
}