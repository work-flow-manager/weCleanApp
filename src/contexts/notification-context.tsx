"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Notification as NotificationData,
  NotificationListResponse,
  NotificationType,
} from "@/types/notification";
import { useToast } from "@/components/ui/use-toast";
import { useRealtime } from "@/contexts/realtime-context";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { createClient } from "@/utils/supabase/client";

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    relatedData?: { jobId?: string; reviewId?: string },
  ) => Promise<void>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { connectionStatus } = useRealtime();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = await Notification.permission;
        setHasPermission(permission === "granted");
      }
    };

    checkPermission();
  }, []);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications?limit=20");

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data: NotificationListResponse = await response.json();

      setNotifications(data.notifications);
      setUnreadCount(data.unread);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Mark a notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_read: true }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, is_read: true }
              : notification,
          ),
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true })),
      );

      setUnreadCount(0);

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Delete a notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }

        // Update local state
        const deletedNotification = notifications.find((n) => n.id === id);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id),
        );

        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        setTotalCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error deleting notification:", err);
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        });
      }
    },
    [notifications, toast],
  );

  // Send a notification to a user
  const sendNotification = useCallback(
    async (
      userId: string,
      title: string,
      message: string,
      type: NotificationType,
      relatedData?: { jobId?: string; reviewId?: string },
    ) => {
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            title,
            message,
            type,
            related_job_id: relatedData?.jobId,
            related_review_id: relatedData?.reviewId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send notification");
        }

        return await response.json();
      } catch (err) {
        console.error("Error sending notification:", err);
        toast({
          title: "Error",
          description: "Failed to send notification",
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast],
  );

  // Set up real-time subscription for notifications
  useRealtimeSubscription({
    channelName: `notifications-${user?.id || "anonymous"}`,
    table: "notifications",
    filter: user ? `user_id=eq.${user.id}` : undefined,
    enabled: !!user && connectionStatus === "connected",
    onInsert: (newNotification: NotificationData) => {
      // Add new notification to state
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setTotalCount((prev) => prev + 1);

      // Show toast notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });

      // Show browser notification if permission granted
      if (
        hasPermission &&
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        try {
          // Create browser notification
          const notification = new Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/logo.png",
          });

          // Handle notification click
          notification.onclick = () => {
            window.focus();
            if (newNotification.related_job_id) {
              window.location.href = `/jobs/${newNotification.related_job_id}`;
            } else if (newNotification.related_review_id) {
              window.location.href = `/reviews/${newNotification.related_review_id}`;
            } else {
              window.location.href = "/notifications";
            }
          };
        } catch (error) {
          console.error("Error showing browser notification:", error);
        }
      }
    },
    onUpdate: (updatedNotification) => {
      // Update notification in state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification,
        ),
      );

      // Update unread count if notification was marked as read
      if (updatedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    onDelete: (deletedNotification) => {
      // Remove notification from state
      setNotifications((prev) =>
        prev.filter(
          (notification) => notification.id !== deletedNotification.id,
        ),
      );

      // Update counts
      if (!deletedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setTotalCount((prev) => Math.max(0, prev - 1));
    },
  });

  // Fetch notifications on initial load
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    totalCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    hasPermission,
    requestPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }

  return context;
}
