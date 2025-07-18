import { useState, useEffect } from 'react';
import { useRealtime } from '@/contexts/realtime-context';
import { RealtimePayload } from '@/lib/realtime';

// Options for real-time subscription
interface UseRealtimeSubscriptionOptions<T> {
  channelName: string;
  table: string;
  schema?: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T, oldPayload: T | null) => void;
  onDelete?: (payload: T) => void;
  enabled?: boolean;
}

// Hook for subscribing to real-time updates
export function useRealtimeSubscription<T = any>({
  channelName,
  table,
  schema = 'public',
  filter,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  const { subscribeToTable, connectionStatus } = useRealtime();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimePayload<T> | null>(null);
  
  useEffect(() => {
    if (!enabled || connectionStatus !== 'connected') {
      setIsSubscribed(false);
      return;
    }
    
    // Handle real-time events
    const handleRealtimeEvent = (payload: RealtimePayload<T>) => {
      setLastEvent(payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          if (onInsert) onInsert(payload.new);
          break;
        case 'UPDATE':
          if (onUpdate) onUpdate(payload.new, payload.old);
          break;
        case 'DELETE':
          if (onDelete && payload.old) onDelete(payload.old);
          break;
      }
    };
    
    // Subscribe to the table
    const unsubscribe = subscribeToTable<T>(
      channelName,
      {
        table,
        schema,
        filter,
        event,
      },
      handleRealtimeEvent
    );
    
    setIsSubscribed(true);
    
    // Cleanup subscription
    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [
    channelName,
    table,
    schema,
    filter,
    event,
    onInsert,
    onUpdate,
    onDelete,
    enabled,
    connectionStatus,
    subscribeToTable,
  ]);
  
  return {
    isSubscribed,
    lastEvent,
    connectionStatus,
  };
}

export default useRealtimeSubscription;