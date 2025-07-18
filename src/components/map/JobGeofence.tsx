"use client";

import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMap } from "./MapContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface JobGeofenceProps {
  jobId: string;
  longitude: number;
  latitude: number;
  radius?: number;
  notifyOnEnter?: boolean;
  notifyOnExit?: boolean;
  editable?: boolean;
  color?: string;
}

export default function JobGeofence({
  jobId,
  longitude,
  latitude,
  radius = 100, // Default radius in meters
  notifyOnEnter = true,
  notifyOnExit = true,
  editable = false,
  color = "#EC4899", // Pink color
}: JobGeofenceProps) {
  const { map, mapLoaded } = useMap();
  const [geofenceRadius, setGeofenceRadius] = useState(radius);
  const [enterNotification, setEnterNotification] = useState(notifyOnEnter);
  const [exitNotification, setExitNotification] = useState(notifyOnExit);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [geofenceId, setGeofenceId] = useState<string | null>(null);

  const sourceId = `geofence-${jobId}`;
  const circleLayerId = `geofence-circle-${jobId}`;
  const outlineLayerId = `geofence-outline-${jobId}`;

  // Load geofence data
  useEffect(() => {
    const loadGeofence = async () => {
      if (!map || !mapLoaded) return;

      try {
        const response = await fetch(`/api/jobs/${jobId}/geofence`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.geofence) {
            setGeofenceId(data.geofence.id);
            setGeofenceRadius(data.geofence.radius);
            setEnterNotification(data.geofence.notification_on_enter);
            setExitNotification(data.geofence.notification_on_exit);
          }
        }
      } catch (error) {
        console.error("Error loading geofence:", error);
      }
    };

    if (editable) {
      loadGeofence();
    }
  }, [jobId, map, mapLoaded, editable]);

  // Create or update the geofence visualization
  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Add source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          properties: {
            radius: geofenceRadius,
          },
        },
      });
    } else {
      // Update existing source
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      source.setData({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          radius: geofenceRadius,
        },
      });
    }

    // Add or update circle layer
    if (!map.getLayer(circleLayerId)) {
      map.addLayer({
        id: circleLayerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-radius-transition": { duration: 300 },
          "circle-opacity": 0.2,
          "circle-color": color,
        },
      });
    } else {
      map.setPaintProperty(circleLayerId, "circle-radius", ["get", "radius"]);
    }

    // Add or update outline layer
    if (!map.getLayer(outlineLayerId)) {
      map.addLayer({
        id: outlineLayerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-radius-transition": { duration: 300 },
          "circle-opacity": 0,
          "circle-stroke-width": 2,
          "circle-stroke-color": color,
        },
      });
    }

    // Clean up on unmount
    return () => {
      if (map.getLayer(outlineLayerId)) {
        map.removeLayer(outlineLayerId);
      }
      if (map.getLayer(circleLayerId)) {
        map.removeLayer(circleLayerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, mapLoaded, longitude, latitude, geofenceRadius, color, sourceId, circleLayerId, outlineLayerId]);

  // Handle radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setGeofenceRadius(value);
      setHasChanges(true);
    }
  };

  // Save geofence settings
  const saveGeofence = async () => {
    try {
      setIsLoading(true);
      
      const method = geofenceId ? "PUT" : "POST";
      const url = geofenceId 
        ? `/api/jobs/${jobId}/geofence/${geofenceId}` 
        : `/api/jobs/${jobId}/geofence`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          radius: geofenceRadius,
          notificationOnEnter: enterNotification,
          notificationOnExit: exitNotification,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!geofenceId) {
          setGeofenceId(data.geofence.id);
        }
        
        setHasChanges(false);
        toast({
          title: "Geofence Saved",
          description: "Job location geofence has been updated.",
        });
      } else {
        throw new Error("Failed to save geofence");
      }
    } catch (error) {
      console.error("Error saving geofence:", error);
      toast({
        title: "Error",
        description: "Failed to save geofence settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If not editable, just render the geofence
  if (!editable) {
    return null;
  }

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-pink-100 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Job Location Geofence</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="radius">Geofence Radius (meters)</Label>
          <Input
            id="radius"
            type="number"
            min="10"
            max="1000"
            value={geofenceRadius}
            onChange={handleRadiusChange}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="enter-notification">Notify on Enter</Label>
          <Switch
            id="enter-notification"
            checked={enterNotification}
            onCheckedChange={(checked) => {
              setEnterNotification(checked);
              setHasChanges(true);
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="exit-notification">Notify on Exit</Label>
          <Switch
            id="exit-notification"
            checked={exitNotification}
            onCheckedChange={(checked) => {
              setExitNotification(checked);
              setHasChanges(true);
            }}
          />
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <Button
          onClick={saveGeofence}
          disabled={isLoading || !hasChanges}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {geofenceId ? "Update Geofence" : "Create Geofence"}
        </Button>
      </div>
    </div>
  );
}