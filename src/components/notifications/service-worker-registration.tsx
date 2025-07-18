"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ServiceWorkerRegistrationProps {
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
}

export function ServiceWorkerRegistration({ onRegistered }: ServiceWorkerRegistrationProps) {
  const { toast } = useToast();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          // Register the service worker
          const reg = await navigator.serviceWorker.register('/service-worker.js');
          
          console.log('Service Worker registered with scope:', reg.scope);
          setRegistration(reg);
          
          if (onRegistered) {
            onRegistered(reg);
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    }
  }, [onRegistered]);

  return null; // This component doesn't render anything
}

// Helper function to convert a base64 string to Uint8Array
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Helper function to subscribe to push notifications
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  publicKey: string
): Promise<PushSubscription | null> {
  try {
    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return subscription;
    }
    
    // Subscribe the user
    const convertedKey = urlBase64ToUint8Array(publicKey);
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Helper function to unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return true;
    }
    
    const result = await subscription.unsubscribe();
    return result;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

export default ServiceWorkerRegistration;