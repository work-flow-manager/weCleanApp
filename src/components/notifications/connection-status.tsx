import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/contexts/realtime-context';

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const { connectionStatus } = useRealtime();
  const [showReconnecting, setShowReconnecting] = useState(false);
  
  // Show reconnecting message after a delay if status is connecting
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (connectionStatus === 'connecting') {
      timeout = setTimeout(() => {
        setShowReconnecting(true);
      }, 3000); // Show reconnecting message after 3 seconds
    } else {
      setShowReconnecting(false);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [connectionStatus]);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", className)}>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 px-2 py-0 h-6",
                connectionStatus === 'connected' && "border-green-500 text-green-600",
                connectionStatus === 'disconnected' && "border-red-500 text-red-600",
                connectionStatus === 'connecting' && "border-amber-500 text-amber-600"
              )}
            >
              {connectionStatus === 'connected' && (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="text-xs">Connected</span>
                </>
              )}
              
              {connectionStatus === 'disconnected' && (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline</span>
                </>
              )}
              
              {connectionStatus === 'connecting' && (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-xs">{showReconnecting ? 'Reconnecting...' : 'Connecting...'}</span>
                </>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {connectionStatus === 'connected' && (
            <p>Real-time connection is active. You will receive live updates.</p>
          )}
          
          {connectionStatus === 'disconnected' && (
            <p>You are offline. Real-time updates are not available.</p>
          )}
          
          {connectionStatus === 'connecting' && (
            <p>{showReconnecting ? 'Attempting to reconnect to the server...' : 'Establishing connection...'}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ConnectionStatus;