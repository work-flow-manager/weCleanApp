"use client";

import React, { useState, useEffect, useRef } from "react";
import MapView from "./MapView";
import ClusterMarker from "./ClusterMarker";
import JobLocationMarker from "./JobLocationMarker";
import RouteVisualization from "./RouteVisualization";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Route as RouteIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  title: string;
  address: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "issue";
  customer: string;
  location: {
    longitude: number;
    latitude: number;
  };
}

interface JobClusterMapProps {
  jobs: Job[];
  height?: string | number;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onJobClick?: (jobId: string) => void;
  showOptimalRoute?: boolean;
  startLocation?: {
    longitude: number;
    latitude: number;
    name?: string;
  };
}

export default function JobClusterMap({
  jobs,
  height = "600px",
  className = "",
  initialCenter,
  initialZoom = 10,
  onJobClick,
  showOptimalRoute = false,
  startLocation,
}: JobClusterMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoute, setShowRoute] = useState(showOptimalRoute);
  const [routePoints, setRoutePoints] = useState<any[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const clusterSourceRef = useRef<any>(null);

  // Calculate map center based on job locations if not provided
  useEffect(() => {
    if (initialCenter) return;

    if (jobs.length === 0) {
      // Default to a reasonable location if no jobs
      setMapCenter([-74.5, 40]); // New York area
      return;
    }

    if (jobs.length === 1) {
      // If only one job, center on it
      const job = jobs[0];
      setMapCenter([job.location.longitude, job.location.latitude]);
      setMapZoom(13); // Closer zoom for single location
      return;
    }

    // Calculate the center of all job locations
    const lngs = jobs.map(job => job.location.longitude);
    const lats = jobs.map(job => job.location.latitude);
    
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    
    setMapCenter([centerLng, centerLat]);
    
    // Calculate appropriate zoom level based on the bounds
    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    const maxDiff = Math.max(lngDiff, latDiff);
    
    if (maxDiff > 1) setMapZoom(8);
    else if (maxDiff > 0.5) setMapZoom(9);
    else if (maxDiff > 0.2) setMapZoom(10);
    else if (maxDiff > 0.1) setMapZoom(11);
    else if (maxDiff > 0.05) setMapZoom(12);
    else setMapZoom(13);
    
  }, [jobs, initialCenter]);

  // Set loading state
  useEffect(() => {
    if (mapCenter) {
      setIsLoading(false);
    }
  }, [mapCenter]);

  // Prepare GeoJSON features for clustering
  useEffect(() => {
    if (!clusterSourceRef.current) return;

    const features = jobs.map(job => ({
      type: "Feature",
      properties: {
        id: job.id,
        title: job.title,
        address: job.address,
        date: job.date,
        time: job.time,
        status: job.status,
        customer: job.customer,
      },
      geometry: {
        type: "Point",
        coordinates: [job.location.longitude, job.location.latitude],
      },
    }));

    clusterSourceRef.current.updateSourceData(features);
  }, [jobs]);

  // Calculate optimal route
  const calculateOptimalRoute = () => {
    if (!startLocation && jobs.length === 0) {
      toast({
        title: "Cannot calculate route",
        description: "Need a starting location and at least one job location",
        variant: "destructive",
      });
      return;
    }

    setIsCalculatingRoute(true);

    // In a real implementation, you would call a routing service API
    // For this example, we'll simulate a simple nearest neighbor algorithm
    
    // Start with the starting location or the first job
    interface RoutePoint {
      longitude: number;
      latitude: number;
      name: string;
    }
    
    const route: RoutePoint[] = [];
    
    if (startLocation) {
      route.push({
        longitude: startLocation.longitude,
        latitude: startLocation.latitude,
        name: startLocation.name || "Start",
      });
    }

    // Simple nearest neighbor algorithm
    const unvisited = [...jobs];
    let currentPoint = startLocation || {
      longitude: unvisited[0].location.longitude,
      latitude: unvisited[0].location.latitude,
    };

    if (!startLocation) {
      // If no start location provided, use the first job
      const firstJob = unvisited.shift();
      if (firstJob) {
        route.push({
          longitude: firstJob.location.longitude,
          latitude: firstJob.location.latitude,
          name: firstJob.title,
        });
      }
    }

    // Find nearest neighbor for each point
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;
      
      // Find the nearest unvisited job
      for (let i = 0; i < unvisited.length; i++) {
        const job = unvisited[i];
        const distance = calculateDistance(
          currentPoint.latitude,
          currentPoint.longitude,
          job.location.latitude,
          job.location.longitude
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      // Add the nearest job to the route
      const nearestJob = unvisited.splice(nearestIndex, 1)[0];
      route.push({
        longitude: nearestJob.location.longitude,
        latitude: nearestJob.location.latitude,
        name: nearestJob.title,
      });
      
      // Update current point
      currentPoint = {
        longitude: nearestJob.location.longitude,
        latitude: nearestJob.location.latitude,
      };
    }

    // Simulate API delay
    setTimeout(() => {
      setRoutePoints(route);
      setShowRoute(true);
      setIsCalculatingRoute(false);
    }, 1000);
  };

  // Calculate distance between two points (Haversine formula)
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

  // Handle cluster click
  const handleClusterClick = (clusterId: number, coordinates: [number, number]) => {
    // Zoom in when a cluster is clicked
    if (mapCenter) {
      setMapCenter(coordinates);
      setMapZoom(Math.min(mapZoom + 2, 16)); // Zoom in, but not too far
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`bg-white/80 backdrop-blur-sm rounded-xl border border-pink-200/30 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500 mb-2" />
          <p className="text-sm text-gray-600">Preparing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapView
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%" }}
        mapStyle="https://api.maptiler.com/maps/streets/style.json?key=get_your_own_key"
      >
        {/* Cluster markers */}
        <ClusterMarker
          sourceId="job-clusters"
          color="#EC4899" // Pink color
          clusterRadius={50}
          clusterMaxZoom={14}
          onClick={handleClusterClick}
          ref={clusterSourceRef}
        />
        
        {/* Individual job markers (will be shown when zoomed in beyond clustering) */}
        {jobs.map(job => (
          <JobLocationMarker
            key={job.id}
            jobId={job.id}
            title={job.title}
            address={job.address}
            date={job.date}
            time={job.time}
            status={job.status}
            customer={job.customer}
            longitude={job.location.longitude}
            latitude={job.location.latitude}
            onClick={() => onJobClick && onJobClick(job.id)}
          />
        ))}
        
        {/* Route visualization */}
        {showRoute && routePoints.length > 1 && (
          <RouteVisualization
            routeId="optimal-route"
            points={routePoints}
            color="#10B981" // Green color
            lineWidth={4}
            showMarkers={true}
            animate={true}
          />
        )}
      </MapView>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm border-pink-200/50 hover:bg-pink-50"
          onClick={() => {
            if (showRoute) {
              setShowRoute(false);
            } else {
              calculateOptimalRoute();
            }
          }}
          disabled={isCalculatingRoute}
        >
          {isCalculatingRoute ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <RouteIcon className="h-4 w-4 mr-2" />
              {showRoute ? "Hide Route" : "Optimize Route"}
            </>
          )}
        </Button>
      </div>

      {/* Job count indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm rounded-md px-3 py-1.5 border border-pink-200/30 text-sm font-medium text-gray-700 flex items-center">
        <MapPin className="h-4 w-4 mr-1.5 text-pink-500" />
        {jobs.length} jobs
      </div>
    </div>
  );
}