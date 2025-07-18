"use client"

import React from 'react';
import { NotificationCenter } from '@/components/notifications';

export default function NotificationsPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Notifications</h1>
      <p className="text-muted-foreground mb-6">
        View and manage your notifications
      </p>
      
      <NotificationCenter />
    </div>
  );
}