"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/notification-context";
import { ServiceWorkerRegistration } from "./service-worker-registration";
import { useToast } from "@/components/ui/use-toast";

// This component handles the notification delivery system
// It doesn't render anything visible but manages the service worker registration
// and handles notification delivery logic

export function NotificationDeliverySystem() {
  const { user } = useAuth();
  const { hasPermission } = useNotifications();
  const { toast } = useToast();
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Handle service worker registration
  const handleServiceWorkerRegistered = (
    registration: ServiceWorkerRegistration,
  ) => {
    setSwRegistration(registration);

    // Set up push message event listener
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "PUSH_RECEIVED") {
        // Handle push message received from service worker
        console.log("Push message received:", event.data);

        // Show toast notification
        if (event.data.notification) {
          toast({
            title: event.data.notification.title,
            description: event.data.notification.body,
          });
        }
      }
    });
  };

  // Set up notification actions
  useEffect(() => {
    if (!swRegistration || !hasPermission) return;

    // Set up notification click handler
    const handleNotificationClick = async (event: Event) => {
      const notification = event as unknown as Notification;

      // Close the notification
      notification.close();

      // Handle notification click based on data
      if (notification.data) {
        const { url, jobId, reviewId } = notification.data;

        // Focus or open window with the appropriate URL
        if (url) {
          // Just open the URL in a new tab
          window.open(url, "_blank");
        }
      }
    };

    // Add event listener for notification clicks
    if ("Notification" in window) {
      Notification.prototype.addEventListener("click", handleNotificationClick);

      return () => {
        Notification.prototype.removeEventListener(
          "click",
          handleNotificationClick,
        );
      };
    }
  }, [swRegistration, hasPermission]);

  // Set up offline notification queue
  useEffect(() => {
    if (!swRegistration || !user) return;

    // Background sync is not fully supported in all browsers
    // We'll skip this feature for now
    console.log("Background sync for notifications is disabled");
  }, [swRegistration, user]);

  return (
    <ServiceWorkerRegistration onRegistered={handleServiceWorkerRegistered} />
  );
}

export default NotificationDeliverySystem;
