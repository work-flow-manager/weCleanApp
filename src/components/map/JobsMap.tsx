"use client";

import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import JobLocationMarker from "./JobLocationMarker";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Loader2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  address: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "issue";
  customer: string;
  location?: {
    longitude: number;
    latitude: number;
  };
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  location?: {
    longitude: number;
    latitude: number;
    lastUpdated?: string;
  };
  isActive?: boolean;
}

interface JobsMapProps {
  jobs: Job[];
  teamMembers?: TeamMember[];
  onJobClick?: (jobId: string) => void;
  onTeamMemberClick?: (memberId: string) => void;
  showTeamLocations?: boolean;
  height?: string | number;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function JobsMap({
  jobs,
  teamMembers = [],
  onJobClick,
  onTeamMemberClick,
  showTeamLocations = false,
  height = "600px",
  className = "",
  initialCenter,
  initialZoom = 10,
}: JobsMapProps) {
  const [displayTeamLocations, setDisplayTeamLocations] = useState(showTeamLocations);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate map center based on job locations if not provided
  useEffect(() => {
    if (initialCenter) return;

    const jobsWithLocation = jobs.filter(job => job.location);
    
    if (jobsWithLocation.length === 0) {
      // Default to a reasonable location if no jobs have coordinates
      setMapCenter([-74.5, 40]); // New York area
      return;
    }

    if (jobsWithLocation.length === 1) {
      // If only one job has location, center on it
      const job = jobsWithLocation[0];
      setMapCenter([job.location!.longitude, job.location!.latitude]);
      setMapZoom(13); // Closer zoom for single location
      return;
    }

    // Calculate the center of all job locations
    const lngs = jobsWithLocation.map(job => job.location!.longitude);
    const lats = jobsWithLocation.map(job => job.location!.latitude);
    
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    
    setMapCenter([centerLng, centerLat]);
    
    // Calculate appropriate zoom level based on the bounds
    // This is a simple approximation
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
        {/* Render job markers */}
        {jobs.filter(job => job.location).map(job => (
          <JobLocationMarker
            key={job.id}
            jobId={job.id}
            title={job.title}
            address={job.address}
            date={job.date}
            time={job.time}
            status={job.status}
            customer={job.customer}
            longitude={job.location!.longitude}
            latitude={job.location!.latitude}
            onClick={() => onJobClick && onJobClick(job.id)}
          />
        ))}

        {/* Render team member markers if enabled */}
        {displayTeamLocations && teamMembers
          .filter(member => member.location)
          .map(member => (
            <TeamMemberMarker
              key={member.id}
              memberId={member.id}
              name={member.name}
              avatar={member.avatar}
              longitude={member.location!.longitude}
              latitude={member.location!.latitude}
              lastUpdated={member.location!.lastUpdated}
              isActive={member.isActive}
              onClick={() => onTeamMemberClick && onTeamMemberClick(member.id)}
            />
          ))}
      </MapView>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {teamMembers.length > 0 && (
          <Button
            variant={displayTeamLocations ? "default" : "outline"}
            size="sm"
            className={`${
              displayTeamLocations
                ? "bg-pink-500 hover:bg-pink-600 text-white"
                : "bg-white/80 backdrop-blur-sm border-pink-200/50 hover:bg-pink-50"
            }`}
            onClick={() => setDisplayTeamLocations(!displayTeamLocations)}
          >
            <Users className="h-4 w-4 mr-2" />
            Team Locations
          </Button>
        )}
      </div>

      {/* Job count indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm rounded-md px-3 py-1.5 border border-pink-200/30 text-sm font-medium text-gray-700 flex items-center">
        <MapPin className="h-4 w-4 mr-1.5 text-pink-500" />
        {jobs.filter(job => job.location).length} locations
      </div>
    </div>
  );
}