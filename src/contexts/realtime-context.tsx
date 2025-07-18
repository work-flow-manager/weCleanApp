import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RealtimePresenceState } from '@supabase/supabase-js';
import { 
  realtimeManager, 
  PresenceUser, 
  RealtimePayload,
  monitorConnectionStatus,
  trackUserPresence,
  updateUserLocation,
  subscribeToNotifications
} from '@/lib/realtime';
import { useAuth } from '@/hooks/useAuth';

// Context interface
interface RealtimeContextType {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  presenceState: RealtimePresenceState<PresenceUser> | null;
  onlineUsers: PresenceUser[];
  subscribeToTable: <T = any>(
    channelName: string,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      schema?: string;
      table?: string;
      filter?: string;
    },
    callback: (payload: RealtimePayload<T>) => void
  ) => () => void;
  broadcast: (channelName: string, eventName: string, payload: any) => void;
  listenToBroadcast: (
    channelName: string,
    eventName: string,
    callback: (payload: any) => void
  ) => () => void;
  updateUserPresence: (presenceData: Partial<PresenceUser>) => void;
  updateLocation: (location: { lat: number; lng: number; accuracy?: number }) => void;
}

// Create context with default values
const RealtimeContext = createContext<RealtimeContextType>({
  connectionStatus: 'disconnected',
  presenceState: null,
  onlineUsers: [],
  subscribeToTable: () => () => {},
  broadcast: () => {},
  listenToBroadcast: () => () => {},
  updateUserPresence: () => {},
  updateLocation: () => {},
});

// Props interface
interface RealtimeProviderProps {
  children: ReactNode;
  companyId?: string;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ 
  children,
  companyId = '00000000-0000-0000-0000-000000000001', // Default company ID
}) => {
  const { user, profile } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [presenceState, setPresenceState] = useState<RealtimePresenceState<PresenceUser> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  
  // Set up connection status monitoring
  useEffect(() => {
    const unsubscribe = monitorConnectionStatus((status) => {
      setConnectionStatus(status as 'connected' | 'disconnected' | 'connecting');
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Set up presence tracking when user is authenticated
  useEffect(() => {
    if (!user || !profile) return;
    
    // Create presence user object
    const presenceUser: PresenceUser = {
      id: user.id,
      name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      status: 'online',
      lastActive: Date.now(),
    };
    
    // Track presence
    const unsubscribe = trackUserPresence(
      companyId,
      presenceUser,
      (state) => {
        setPresenceState(state);
        
        // Convert presence state to array of users
        const users: PresenceUser[] = [];
        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            users.push(presence);
          });
        });
        
        setOnlineUsers(users);
      }
    );
    
    // Set up heartbeat to update last active time
    const heartbeatInterval = setInterval(() => {
      updateUserPresence({
        lastActive: Date.now(),
      });
    }, 30000); // Every 30 seconds
    
    return () => {
      unsubscribe();
      clearInterval(heartbeatInterval);
    };
  }, [user, profile, companyId]);
  
  // Subscribe to notifications when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToNotifications(user.id, (payload) => {
      // This will be handled by the notification context
      console.log('Notification received:', payload);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  // Update user presence
  const updateUserPresence = (presenceData: Partial<PresenceUser>) => {
    if (!user) return;
    
    realtimeManager.updatePresence(
      `company-presence-${companyId}`,
      {
        id: user.id,
        ...presenceData,
      }
    );
  };
  
  // Update user location
  const updateLocation = (location: { lat: number; lng: number; accuracy?: number }) => {
    if (!user) return;
    
    updateUserLocation(companyId, user.id, location);
  };
  
  // Context value
  const value: RealtimeContextType = {
    connectionStatus,
    presenceState,
    onlineUsers,
    subscribeToTable: realtimeManager.subscribeToTable.bind(realtimeManager),
    broadcast: realtimeManager.broadcast.bind(realtimeManager),
    listenToBroadcast: realtimeManager.listenToBroadcast.bind(realtimeManager),
    updateUserPresence,
    updateLocation,
  };
  
  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// Custom hook to use the realtime context
export const useRealtime = () => useContext(RealtimeContext);

export default RealtimeContext;