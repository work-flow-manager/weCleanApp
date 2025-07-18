import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/notification-context';

interface NotificationBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'default' | 'sm';
}

export function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  className,
  variant = 'default',
  size = 'default',
}: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();
  
  // Use provided count or unreadCount from context
  const displayCount = count !== undefined ? count : unreadCount;
  
  // Don't render if count is 0 and showZero is false
  if (displayCount === 0 && !showZero) {
    return null;
  }
  
  // Format count with "+" if it exceeds max
  const formattedCount = displayCount > max ? `${max}+` : displayCount.toString();
  
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-full",
        size === 'sm' ? "h-5 min-w-[1.25rem] px-1 text-xs" : "h-6 min-w-[1.5rem] px-1.5 text-xs",
        variant === 'default' && "bg-pink-500 hover:bg-pink-600",
        className
      )}
    >
      {formattedCount}
    </Badge>
  );
}

export default NotificationBadge;