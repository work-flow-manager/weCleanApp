"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Navigation,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface MapViewProps {
  jobs?: JobLocation[];
  teamMembers?: TeamMemberLocation[];
  center?: [number, number];
  zoom?: number;
  showTeamMembers?: boolean;
  showJobLocations?: boolean;
  onMarkerClick?: (id: string, type: "job" | "team") => void;
}

interface JobLocation {
  id: string;
  location: [number, number];
  address: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  assignedTeam?: string[];
}

interface TeamMemberLocation {
  id: string;
  name: string;
  location: [number, number];
  status: "available" | "on-job" | "off-duty";
  currentJobId?: string;
  eta?: number; // in minutes
}

const MapView: React.FC<MapViewProps> = ({
  jobs = [
    {
      id: "job-1",
      location: [-73.9712, 40.7831],
      address: "123 Central Park West, New York, NY",
      status: "pending",
      assignedTeam: ["team-1", "team-2"],
    },
    {
      id: "job-2",
      location: [-73.9632, 40.7794],
      address: "456 5th Avenue, New York, NY",
      status: "in-progress",
      assignedTeam: ["team-3"],
    },
    {
      id: "job-3",
      location: [-73.9882, 40.7484],
      address: "789 Broadway, New York, NY",
      status: "completed",
      assignedTeam: ["team-1"],
    },
  ],
  teamMembers = [
    {
      id: "team-1",
      name: "Alice Johnson",
      location: [-73.9702, 40.7821],
      status: "on-job",
      currentJobId: "job-1",
      eta: 15,
    },
    {
      id: "team-2",
      name: "Bob Smith",
      location: [-73.9722, 40.7841],
      status: "on-job",
      currentJobId: "job-1",
      eta: 15,
    },
    {
      id: "team-3",
      name: "Carol Davis",
      location: [-73.9642, 40.7784],
      status: "on-job",
      currentJobId: "job-2",
      eta: 5,
    },
  ],
  center = [-73.9712, 40.7831],
  zoom = 13,
  showTeamMembers = true,
  showJobLocations = true,
  onMarkerClick = () => {},
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapView, setMapView] = useState<"standard" | "satellite" | "traffic">(
    "standard",
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [mapZoom, setMapZoom] = useState<number>(zoom);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Mock function to simulate map initialization
  useEffect(() => {
    // In a real implementation, this would initialize MapLibre GL JS
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter jobs based on selected filter
  const filteredJobs = jobs.filter((job) => {
    if (selectedFilter === "all") return true;
    return job.status === selectedFilter;
  });

  return (
    <Card className="w-full h-full overflow-hidden bg-pink-50/80 backdrop-blur-md border border-pink-200/50 shadow-lg rounded-xl">
      <div className="p-4 border-b border-pink-200/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Location Tracker
            </h2>
            <p className="text-sm text-gray-500">
              Track jobs and team members in real-time
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tabs
              defaultValue="all"
              className="w-full sm:w-auto"
              onValueChange={setSelectedFilter}
            >
              <TabsList className="bg-pink-100/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs
              defaultValue="standard"
              className="w-full sm:w-auto"
              onValueChange={(v) => setMapView(v as any)}
            >
              <TabsList className="bg-pink-100/50">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="satellite">Satellite</TabsTrigger>
                <TabsTrigger value="traffic">Traffic</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <CardContent className="p-0 relative">
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-pink-200/50 hover:bg-pink-100/50"
          >
            <MapPin className="h-4 w-4 mr-1 text-pink-500" /> Center Map
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-pink-200/50 hover:bg-pink-100/50"
          >
            <Navigation className="h-4 w-4 mr-1 text-pink-500" /> Directions
          </Button>
        </div>

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-md border border-pink-200/50">
            <span className="text-xs font-medium text-gray-700">Zoom:</span>
            <Slider
              value={[mapZoom]}
              min={5}
              max={18}
              step={0.5}
              className="w-32"
              onValueChange={(value) => setMapZoom(value[0])}
            />
            <span className="text-xs font-medium text-gray-700">
              {mapZoom.toFixed(1)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={showJobLocations ? "default" : "outline"}
              className={
                showJobLocations
                  ? "bg-pink-500 hover:bg-pink-600"
                  : "bg-white/80 backdrop-blur-sm border-pink-200/50 hover:bg-pink-100/50"
              }
              onClick={() => {}}
            >
              <MapPin className="h-4 w-4 mr-1" /> Jobs
            </Button>
            <Button
              size="sm"
              variant={showTeamMembers ? "default" : "outline"}
              className={
                showTeamMembers
                  ? "bg-pink-500 hover:bg-pink-600"
                  : "bg-white/80 backdrop-blur-sm border-pink-200/50 hover:bg-pink-100/50"
              }
              onClick={() => {}}
            >
              <Users className="h-4 w-4 mr-1" /> Team
            </Button>
          </div>
        </div>

        {/* Map container */}
        <div
          ref={mapContainer}
          className="w-full h-[500px] bg-pink-50"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!mapLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-pink-50/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-700">Loading map...</p>
              </div>
            </div>
          )}

          {/* This would be replaced by actual MapLibre GL JS rendering */}
          {mapLoaded && (
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2 overflow-auto max-h-48 p-2 bg-white/80 backdrop-blur-sm rounded-md border border-pink-200/50">
              <h3 className="w-full text-sm font-medium text-gray-700 mb-1">
                Locations ({filteredJobs.length})
              </h3>

              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-2 p-2 bg-white rounded-md border border-pink-100 cursor-pointer hover:bg-pink-50 transition-colors"
                  onClick={() => onMarkerClick(job.id, "job")}
                >
                  <div className="flex-shrink-0">
                    {job.status === "pending" && (
                      <Clock className="h-5 w-5 text-amber-400" />
                    )}
                    {job.status === "in-progress" && (
                      <Navigation className="h-5 w-5 text-pink-500" />
                    )}
                    {job.status === "completed" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {job.status === "cancelled" && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {job.address}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 border-pink-200 text-pink-700"
                      >
                        {job.status.replace("-", " ")}
                      </Badge>
                      {job.assignedTeam && (
                        <span className="text-[10px] text-gray-500">
                          {job.assignedTeam.length} team member
                          {job.assignedTeam.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <p className="text-sm text-gray-500 w-full text-center py-2">
                  No jobs match the selected filter
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapView;
