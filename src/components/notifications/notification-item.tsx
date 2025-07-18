"use client"

import React from 'react';
import { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Star, Calendar, MessageSquare, CreditCard, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: NotificationItemProps) {
  // Format date as relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'review_submitted':
      case 'review_response':
      case 'negative_review':
        return <Star className="h-5 w-5" />;
      case 'job_assigned':
      case 'job_status_update':
        return <Calendar className="h-5 w-5" />;
      case 'payment_received':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Get background color based on notification type and read status
  const getBgColor = () => {
    if (notification.is_read) {
      return 'bg-background hover:bg-muted/50';
    }
    
    if (notification.type === 'negative_review') {
      return 'bg-destructive/10 hover:bg-destructive/20';
    }
    
    return 'bg-primary/5 hover:bg-primary/10';
  };
  
  // Handle mark as read
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };
  
  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div 
      className={cn(
        "p-4 border-b last:border-b-0 transition-colors",
        getBgColor()
      )}
    >
      <div className="flex gap-3">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          notification.is_read ? 'bg-muted' : 'bg-primary/10'
        )}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "text-sm font-medium",
              !notification.is_read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
              {formattedDate}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 break-words">
            {notification.message}
          </p>
          
          <div className="flex justify-end mt-2 gap-2">
            {!notification.is_read && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={handleMarkAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                <span className="text-xs">Mark as read</span>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}