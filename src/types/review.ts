// Review-related types and interfaces

export interface Review {
  id: string;
  job_id: string;
  customer_id: string;
  rating: number; // 1-5
  review_text?: string;
  photos?: string[];
  created_at: string;
  updated_at?: string;
  response?: ReviewResponse;
  
  // Related data
  customers?: any;
  jobs?: any;
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  response_text: string;
  responded_by: string;
  created_at: string;
  updated_at?: string;
  
  // Related data
  profiles?: any;
}

// API Request/Response types
export interface CreateReviewRequest {
  job_id: string;
  rating: number;
  review_text?: string;
  photos?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  review_text?: string;
  photos?: string[];
}

export interface CreateReviewResponseRequest {
  response_text: string;
}

export interface ReviewFilters {
  job_id?: string;
  customer_id?: string;
  min_rating?: number;
  max_rating?: number;
  has_response?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReviewResponse {
  review: Review;
}

// Utility types for review statistics
export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  response_rate: number;
}

// Review validation helpers
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_REVIEW_TEXT_LENGTH = 1000;
export const MAX_PHOTOS = 5;
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB