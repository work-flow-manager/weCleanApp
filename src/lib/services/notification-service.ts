import { supabase } from '@/lib/supabase/client';
import { 
  Notification, 
  NotificationType, 
  CreateNotificationRequest,
  ReviewNotificationData,
  NOTIFICATION_TEMPLATES
} from '@/types/notification';

/**
 * Service for handling notifications
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: CreateNotificationRequest): Promise<Notification | null> {
    try {
      
      
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type,
          related_job_id: data.related_job_id,
          related_review_id: data.related_review_id,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }
      
      return notification as Notification;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  }
  
  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }
  
  /**
   * Mark all notifications for a user as read
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }
  
  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string, 
    limit: number = 10, 
    offset: number = 0,
    includeRead: boolean = true
  ): Promise<{ notifications: Notification[], total: number, unread: number }> {
    try {
      
      
      // Get total count of notifications
      const { count: total, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // Get unread count
      const { count: unread, error: unreadError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      // Build query for notifications
      let query = supabase
        .from('notifications')
        .select(`
          *,
          profiles:user_id (*),
          jobs:related_job_id (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Filter by read status if needed
      if (!includeRead) {
        query = query.eq('is_read', false);
      }
      
      const { data, error } = await query;
      
      if (error || countError || unreadError) {
        console.error('Error fetching notifications:', error || countError || unreadError);
        return { notifications: [], total: 0, unread: 0 };
      }
      
      return { 
        notifications: data as Notification[], 
        total: total || 0,
        unread: unread || 0
      };
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return { notifications: [], total: 0, unread: 0 };
    }
  }
  
  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }
  
  /**
   * Create review submission notification
   */
  static async createReviewSubmissionNotifications(data: ReviewNotificationData): Promise<boolean> {
    try {
      // Determine if this is a negative review (rating <= 3)
      const isNegativeReview = data.rating <= 3;
      
      // Format job ID for display (e.g., "ABC123")
      const shortJobId = data.job_id.substring(0, 6).toUpperCase();
      
      // Create notifications for managers
      const managerPromises = data.manager_ids.map(async (managerId) => {
        // Determine notification type and template
        const notificationType: NotificationType = isNegativeReview 
          ? 'negative_review' 
          : 'review_submitted';
        
        const template = NOTIFICATION_TEMPLATES[notificationType];
        
        // Replace placeholders in template
        const title = template.title;
        const message = template.message
          .replace('{rating}', data.rating.toString())
          .replace('{jobId}', shortJobId);
        
        // Create the notification
        return this.createNotification({
          user_id: managerId,
          title,
          message,
          type: notificationType,
          related_job_id: data.job_id,
          related_review_id: data.review_id
        });
      });
      
      // Wait for all notifications to be created
      await Promise.all(managerPromises);
      
      return true;
    } catch (error) {
      console.error('Error in createReviewSubmissionNotifications:', error);
      return false;
    }
  }
  
  /**
   * Create review response notification
   */
  static async createReviewResponseNotification(
    reviewId: string,
    jobId: string,
    customerId: string
  ): Promise<boolean> {
    try {
      // Format job ID for display
      const shortJobId = jobId.substring(0, 6).toUpperCase();
      
      // Get template
      const template = NOTIFICATION_TEMPLATES.review_response;
      
      // Replace placeholders in template
      const title = template.title;
      const message = template.message.replace('{jobId}', shortJobId);
      
      // Create notification for customer
      await this.createNotification({
        user_id: customerId,
        title,
        message,
        type: 'review_response',
        related_job_id: jobId,
        related_review_id: reviewId
      });
      
      return true;
    } catch (error) {
      console.error('Error in createReviewResponseNotification:', error);
      return false;
    }
  }
}