"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Bell, BellOff, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/notification-context';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from './service-worker-registration';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface PushNotificationPermissionProps {
  className?: string;
}

export function PushNotificationPermission({ className }: PushNotificationPermissionProps) {
  const { user } = useAuth();
  const { hasPermission, requestPermission } = useNotifications();
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  
  // Check if push notifications are supported
  const isPushSupported = 
    typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window;
  
  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      if (!isPushSupported) {
        setPermissionStatus('unsupported');
        return;
      }
      
      if ('Notification' in window) {
        const permission = await Notification.permission;
        setPermissionStatus(permission);
      }
    };
    
    checkPermission();
  }, [isPushSupported]);
  
  // Check for existing subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isPushSupported) return;
      
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        setSubscription(existingSubscription);
      } catch (error) {
        console.error('Error checking push subscription:', error);
      }
    };
    
    checkSubscription();
  }, [isPushSupported]);
  
  // Handle enable push notifications
  const handleEnablePushNotifications = async () => {
    if (!isPushSupported || !user) return;
    
    setIsSubscribing(true);
    
    try {
      // Request permission if not granted
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          toast({
            title: 'Permission Denied',
            description: 'Please enable notifications in your browser settings',
            variant: 'destructive',
          });
          setIsSubscribing(false);
          return;
        }
        
        setPermissionStatus('granted');
      }
      
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from server
      const response = await fetch('/api/notifications/vapid-public-key');
      const { publicKey } = await response.json();
      
      // Subscribe to push notifications
      const newSubscription = await subscribeToPushNotifications(registration, publicKey);
      
      if (!newSubscription) {
        throw new Error('Failed to subscribe to push notifications');
      }
      
      // Save subscription to server
      await fetch('/api/notifications/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscription: newSubscription.toJSON(),
        }),
      });
      
      setSubscription(newSubscription);
      
      toast({
        title: 'Success',
        description: 'Push notifications have been enabled',
      });
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications',
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };
  
  // Handle disable push notifications
  const handleDisablePushNotifications = async () => {
    if (!isPushSupported || !subscription || !user) return;
    
    setIsUnsubscribing(true);
    
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Unsubscribe from push notifications
      const success = await unsubscribeFromPushNotifications(registration);
      
      if (!success) {
        throw new Error('Failed to unsubscribe from push notifications');
      }
      
      // Delete subscription from server
      await fetch('/api/notifications/subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          endpoint: subscription.endpoint,
        }),
      });
      
      setSubscription(null);
      
      toast({
        title: 'Success',
        description: 'Push notifications have been disabled',
      });
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable push notifications',
        variant: 'destructive',
      });
    } finally {
      setIsUnsubscribing(false);
    }
  };
  
  // Render different content based on support and permission status
  const renderContent = () => {
    if (!isPushSupported) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not Supported</AlertTitle>
          <AlertDescription>
            Push notifications are not supported in your browser.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (permissionStatus === 'denied') {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            You have blocked notifications for this site. Please update your browser settings to enable notifications.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (subscription) {
      return (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Notifications Enabled</AlertTitle>
          <AlertDescription>
            You will receive push notifications for important updates.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Notifications Disabled</AlertTitle>
        <AlertDescription>
          Enable push notifications to stay updated with important information.
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Receive important updates even when you're not using the app
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderContent()}
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Job Assignments</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when you're assigned to a new job
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Status Updates</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when job statuses change
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive new reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        {subscription ? (
          <Button
            variant="outline"
            onClick={handleDisablePushNotifications}
            disabled={isUnsubscribing || permissionStatus === 'denied'}
          >
            <BellOff className="mr-2 h-4 w-4" />
            Disable Notifications
          </Button>
        ) : (
          <Button
            onClick={handleEnablePushNotifications}
            disabled={isSubscribing || permissionStatus === 'denied' || !isPushSupported}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default PushNotificationPermission;