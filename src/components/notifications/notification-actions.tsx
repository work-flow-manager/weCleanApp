"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Notification } from '@/types/notification';
import { Eye, MessageSquare, ThumbsUp, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface NotificationActionsProps {
  notification: Notification;
  className?: string;
}

export function NotificationActions({ notification, className }: NotificationActionsProps) {
  // Get actions based on notification type
  const getActions = () => {
    switch (notification.type) {
      case 'job_assigned':
      case 'job_status_update':
        return [
          {
            label: 'View Job',
            icon: <Eye className="h-4 w-4 mr-2" />,
            href: `/jobs/${notification.related_job_id}`,
            primary: true,
          },
          {
            label: 'View Schedule',
            icon: <Calendar className="h-4 w-4 mr-2" />,
            href: '/schedule',
            primary: false,
          },
          {
            label: 'View Map',
            icon: <MapPin className="h-4 w-4 mr-2" />,
            href: `/map?job=${notification.related_job_id}`,
            primary: false,
          },
        ];
        
      case 'review_submitted':
      case 'review_response':
      case 'negative_review':
        return [
          {
            label: 'View Review',
            icon: <Eye className="h-4 w-4 mr-2" />,
            href: `/reviews/${notification.related_review_id}`,
            primary: true,
          },
          {
            label: 'Respond',
            icon: <MessageSquare className="h-4 w-4 mr-2" />,
            href: `/reviews/${notification.related_review_id}?respond=true`,
            primary: false,
          },
          {
            label: 'View Job',
            icon: <Calendar className="h-4 w-4 mr-2" />,
            href: `/jobs/${notification.related_job_id}`,
            primary: false,
          },
        ];
        
      case 'payment_received':
        return [
          {
            label: 'View Invoice',
            icon: <Eye className="h-4 w-4 mr-2" />,
            href: `/invoices?job=${notification.related_job_id}`,
            primary: true,
          },
          {
            label: 'Thank Customer',
            icon: <ThumbsUp className="h-4 w-4 mr-2" />,
            href: `/jobs/${notification.related_job_id}?thank=true`,
            primary: false,
          },
        ];
        
      default:
        return [
          {
            label: 'View Details',
            icon: <Eye className="h-4 w-4 mr-2" />,
            href: '/notifications',
            primary: true,
          },
        ];
    }
  };
  
  const actions = getActions();
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Actions</CardTitle>
        <CardDescription>Take action on this notification</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.primary ? "default" : "outline"}
              size="sm"
              className={action.primary ? "bg-pink-500 hover:bg-pink-600" : ""}
              asChild
            >
              <Link href={action.href}>
                {action.icon}
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationActions;