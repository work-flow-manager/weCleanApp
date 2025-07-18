"use client"

import React from 'react';
import { Star, Calendar, FileText, Image, AlertCircle, Package, ShoppingCart, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'star' | 'calendar' | 'file' | 'image' | 'alert' | 'package' | 'cart' | 'user' | 'message';
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = 'alert',
  className,
  children
}: EmptyStateProps) {
  // Map of icon types to Lucide components
  const iconMap = {
    star: Star,
    calendar: Calendar,
    file: FileText,
    image: Image,
    alert: AlertCircle,
    package: Package,
    cart: ShoppingCart,
    user: User,
    message: MessageSquare
  };
  
  // Get the icon component
  const IconComponent = iconMap[icon];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed",
      className
    )}>
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <IconComponent className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}