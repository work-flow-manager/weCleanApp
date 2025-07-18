// Notification-related types and interfaces

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  related_job_id?: string;
  related_review_id?: string;
  created_at: string;
  
  // Related data
  profiles?: any;
  jobs?: any;
  reviews?: any;
}

export type NotificationType = 
  | 'review_submitted'
  | 'review_response'
  | 'negative_review'
  | 'job_assigned'
  | 'job_status_update'
  | 'payment_received'
  | 'system';

// API Request/Response types
export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_job_id?: string;
  related_review_id?: string;
}

export interface UpdateNotificationRequest {
  is_read?: boolean;
}

export interface NotificationFilters {
  user_id?: string;
  type?: NotificationType;
  is_read?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

// Notification service types
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

// Review notification specific types
export interface ReviewNotificationData {
  review_id: string;
  job_id: string;
  customer_id: string;
  rating: number;
  review_text?: string;
  business_id: string;
  manager_ids: string[];
}

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  review_submitted: {
    title: 'New Review Received',
    message: 'A new {rating}-star review has been submitted for job #{jobId}.'
  },
  review_response: {
    title: 'Response to Your Review',
    message: 'The business has responded to your review for job #{jobId}.'
  },
  negative_review: {
    title: 'Negative Review Alert',
    message: 'A {rating}-star review requires your attention for job #{jobId}.'
  }
};