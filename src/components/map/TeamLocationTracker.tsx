"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateTeamMemberLocation } from "@/lib/supabase/teamLocations";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, MapPin, AlertCircle } from "lucide-react";

interface TeamLocationTrackerProps {
  enabled?: boolean;
  onStatusChange?: (isTracking: boolean) => void;
  updateInterval?: number; // in milliseconds
  minimumDistance?: number; // in meters
  showControls?: boolean;
}

export default function TeamLocationTracker({
  enabled = false,
  onStatusChange,
  updateInterval = 60000, // Default: update every minute
  minimumDistance = 10, // Default: minimum 10 meters movement to update
  showControls = true,
}: TeamLocationTrackerProps) {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(enabled);
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [privacySettings, setPrivacySettings] = useState({
    trackingEnabled: enabled,
    shareAccuracy: true,
    trackOnlyDuringShift: true,
  });

  // Calculate distance between two points in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  // Handle position update
  const handlePositionUpdate = useCallback(
    async (position: GeolocationPosition) => {
      if (!user) return;

      const { latitude, longitude, accuracy } = position.coords;
      
      // Check if we've moved enough to update
      if (lastPosition) {
        const distance = calculateDistance(
          lastPosition.coords.latitude,
          lastPosition.coords.longitude,
          latitude,
          longitude
        );
        
        // Skip update if we haven't moved enough
        if (distance < minimumDistance) {
          return;
        }
      }

      try {
        setIsUpdating(true);
        
        // Update location in database
        await updateTeamMemberLocation({
          teamMemberId: user.id,
          latitude,
          longitude,
          accuracy: privacySettings.shareAccuracy ? accuracy : null,
          timestamp: new Date().toISOString(),
        });
        
        setLastPosition(position);
      } catch (err) {
        console.error("Failed to update location:", err);
        setError("Failed to update location. Please try again.");
        toast({
          title: "Location Update Failed",
          description: "We couldn't update your location. Please check your connection.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [user, lastPosition, minimumDistance, privacySettings.shareAccuracy]
  );

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    try {
      // Clear any existing watch
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      // Set up options for geolocation
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      // Start watching position
      const id = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        (err) => {
          console.error("Geolocation error:", err);
          setError(`Location error: ${err.message}`);
          toast({
            title: "Location Error",
            description: `We couldn't access your location: ${err.message}`,
            variant: "destructive",
          });
        },
        options
      );

      setWatchId(id);
      setIsTracking(true);
      setError(null);
      
      if (onStatusChange) {
        onStatusChange(true);
      }

      toast({
        title: "Location Tracking Active",
        description: "Your location is now being shared with your team.",
      });
    } catch (err) {
      console.error("Error starting location tracking:", err);
      setError("Failed to start location tracking");
      setIsTracking(false);
    }
  }, [watchId, handlePositionUpdate, onStatusChange]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setIsTracking(false);
    
    if (onStatusChange) {
      onStatusChange(false);
    }

    toast({
      title: "Location Tracking Paused",
      description: "Your location is no longer being shared.",
    });
  }, [watchId, onStatusChange]);

  // Toggle tracking
  const toggleTracking = () => {
    const newTrackingState = !isTracking;
    setPrivacySettings(prev => ({
      ...prev,
      trackingEnabled: newTrackingState
    }));
    
    if (newTrackingState) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  // Update privacy settings
  const updatePrivacySettings = (setting: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));

    // If turning off tracking, stop the tracker
    if (setting === 'trackingEnabled' && !value && isTracking) {
      stopTracking();
    }
    
    // If turning on tracking, start the tracker
    if (setting === 'trackingEnabled' && value && !isTracking) {
      startTracking();
    }
  };

  // Start/stop tracking based on enabled prop
  useEffect(() => {
    if (enabled && !isTracking && privacySettings.trackingEnabled) {
      startTracking();
    } else if (!enabled && isTracking) {
      stopTracking();
    }
  }, [enabled, isTracking, privacySettings.trackingEnabled, startTracking, stopTracking]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  if (!showControls) {
    return null;
  }

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-pink-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Location Tracking</h3>
        <div className="flex items-center">
          <Switch
            id="tracking-toggle"
            checked={privacySettings.trackingEnabled}
            onCheckedChange={(checked) => updatePrivacySettings('trackingEnabled', checked)}
          />
          <Label htmlFor="tracking-toggle" className="ml-2">
            {privacySettings.trackingEnabled ? "Enabled" : "Disabled"}
          </Label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-800 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="accuracy-toggle" className="text-sm text-gray-700">
            Share location accuracy
          </Label>
          <Switch
            id="accuracy-toggle"
            checked={privacySettings.shareAccuracy}
            onCheckedChange={(checked) => updatePrivacySettings('shareAccuracy', checked)}
            disabled={!privacySettings.trackingEnabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="shift-toggle" className="text-sm text-gray-700">
            Track only during shifts
          </Label>
          <Switch
            id="shift-toggle"
            checked={privacySettings.trackOnlyDuringShift}
            onCheckedChange={(checked) => updatePrivacySettings('trackOnlyDuringShift', checked)}
            disabled={!privacySettings.trackingEnabled}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2 text-pink-500" />
          {isTracking ? (
            <span>
              {isUpdating ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Updating location...
                </span>
              ) : (
                "Location tracking active"
              )}
            </span>
          ) : (
            "Location tracking is paused"
          )}
        </div>
        
        {lastPosition && (
          <div className="mt-2 text-xs text-gray-500">
            Last updated: {new Date(lastPosition.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}