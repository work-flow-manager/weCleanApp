import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Types for real-time events
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
  eventType: RealtimeEvent;
  new: T;
  old: T | null;
  table: string;
  schema: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: number;
  };
  status?: 'online' | 'away' | 'busy';
  lastActive?: number;
}

// Channel subscription options
export interface ChannelSubscriptionOptions {
  event?: RealtimeEvent | '*';
  schema?: string;
  table?: string;
  filter?: string;
}

// Subscription manager to handle real-time subscriptions
export class RealtimeSubscriptionManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private connectionListeners: Set<(status: string) => void> = new Set();
  
  // Get or create a channel
  private getOrCreateChannel(channelName: string): RealtimeChannel {
    if (!this.channels.has(channelName)) {
      const channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
      
      // Add connection status listener
      channel.on('system', { event: 'connection_status' }, (status) => {
        this.connectionStatus = status.status === 'SUBSCRIBED' ? 'connected' : 'disconnected';
        this.notifyConnectionListeners();
      });
    }
    
    return this.channels.get(channelName)!;
  }
  
  // Subscribe to database changes
  public subscribeToTable<T = any>(
    channelName: string,
    options: ChannelSubscriptionOptions,
    callback: (payload: RealtimePayload<T>) => void
  ): () => void {
    const channel = this.getOrCreateChannel(channelName);
    
    // Build the subscription options
    const subscriptionOptions: any = {
      event: options.event || '*',
      schema: options.schema || 'public',
    };
    
    if (options.table) {
      subscriptionOptions.table = options.table;
    }
    
    if (options.filter) {
      subscriptionOptions.filter = options.filter;
    }
    
    // Subscribe to the channel
    channel
      .on('postgres_changes', subscriptionOptions, (payload) => {
        callback(payload as unknown as RealtimePayload<T>);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${channelName}`);
        }
      });
    
    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }
  
  // Subscribe to presence updates
  public subscribeToPresence(
    channelName: string,
    user: PresenceUser,
    onPresenceChange: (state: RealtimePresenceState<PresenceUser>) => void
  ): () => void {
    const channel = this.getOrCreateChannel(channelName);
    
    // Track user presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>();
        onPresenceChange(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence once subscribed
          await channel.track(user);
        }
      });
    
    // Return unsubscribe function
    return () => {
      channel.untrack();
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }
  
  // Update user presence
  public updatePresence(channelName: string, presenceData: Partial<PresenceUser>): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.track(presenceData);
    }
  }
  
  // Broadcast a message to the channel
  public broadcast(
    channelName: string,
    eventName: string,
    payload: any
  ): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: eventName,
        payload,
      });
    }
  }
  
  // Listen for broadcast messages
  public listenToBroadcast(
    channelName: string,
    eventName: string,
    callback: (payload: any) => void
  ): () => void {
    const channel = this.getOrCreateChannel(channelName);
    
    channel.on('broadcast', { event: eventName }, (message) => {
      callback(message.payload);
    });
    
    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }
  
  // Add connection status listener
  public addConnectionListener(listener: (status: string) => void): () => void {
    this.connectionListeners.add(listener);
    
    // Immediately notify with current status
    listener(this.connectionStatus);
    
    // Return function to remove listener
    return () => {
      this.connectionListeners.delete(listener);
    };
  }
  
  // Notify all connection listeners
  private notifyConnectionListeners(): void {
    this.connectionListeners.forEach((listener) => {
      listener(this.connectionStatus);
    });
  }
  
  // Get current connection status
  public getConnectionStatus(): string {
    return this.connectionStatus;
  }
  
  // Unsubscribe from all channels
  public unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    
    this.channels.clear();
    this.connectionStatus = 'disconnected';
    this.notifyConnectionListeners();
  }
}

// Create a singleton instance
export const realtimeManager = new RealtimeSubscriptionManager();

// Helper functions for common real-time subscriptions

// Subscribe to job updates
export const subscribeToJobUpdates = (
  jobId: string,
  callback: (payload: RealtimePayload) => void
): () => void => {
  return realtimeManager.subscribeToTable(
    `job-updates-${jobId}`,
    {
      table: 'jobs',
      filter: `id=eq.${jobId}`,
    },
    callback
  );
};

// Subscribe to team location updates
export const subscribeToTeamLocations = (
  companyId: string,
  callback: (payload: RealtimePayload) => void
): () => void => {
  return realtimeManager.subscribeToTable(
    `team-locations-${companyId}`,
    {
      table: 'team_locations',
      filter: `company_id=eq.${companyId}`,
    },
    callback
  );
};

// Subscribe to notifications
export const subscribeToNotifications = (
  userId: string,
  callback: (payload: RealtimePayload) => void
): () => void => {
  return realtimeManager.subscribeToTable(
    `notifications-${userId}`,
    {
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    callback
  );
};

// Track user presence in a company channel
export const trackUserPresence = (
  companyId: string,
  user: PresenceUser,
  onPresenceChange: (state: RealtimePresenceState<PresenceUser>) => void
): () => void => {
  return realtimeManager.subscribeToPresence(
    `company-presence-${companyId}`,
    user,
    onPresenceChange
  );
};

// Update user location
export const updateUserLocation = (
  companyId: string,
  userId: string,
  location: { lat: number; lng: number; accuracy?: number }
): void => {
  realtimeManager.updatePresence(`company-presence-${companyId}`, {
    id: userId,
    location: {
      ...location,
      timestamp: Date.now(),
    },
  });
};

// Broadcast a message to company channel
export const broadcastToCompany = (
  companyId: string,
  eventName: string,
  payload: any
): void => {
  realtimeManager.broadcast(`company-presence-${companyId}`, eventName, payload);
};

// Listen for company broadcasts
export const listenToCompanyBroadcasts = (
  companyId: string,
  eventName: string,
  callback: (payload: any) => void
): () => void => {
  return realtimeManager.listenToBroadcast(
    `company-presence-${companyId}`,
    eventName,
    callback
  );
};

// Monitor connection status
export const monitorConnectionStatus = (
  callback: (status: string) => void
): () => void => {
  return realtimeManager.addConnectionListener(callback);
};