"use client";

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MapView, RouteVisualization, RouteOptimizer } from "@/components/map";
import { RouteShareDialog } from "@/components/map";
import { Route as RouteIcon, Share2, MapPin, Clock, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Sample data for demonstration
const sampleJobs = [
  {
    id: "job1",
    name: "Johnson Residence",
    address: "123 Main St, San Francisco, CA",
    date: "July 20, 2025",
    time: "9:00 AM",
    duration: 120, // minutes
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: "job2",
    name: "Smith Office",
    address: "456 Market St, San Francisco, CA",
    date: "July 20, 2025",
    time: "1:00 PM",
    duration: 180, // minutes
    latitude: 37.7914,
    longitude: -122.4284
  },
  {
    id: "job3",
    name: "New Building",
    address: "789 Howard St, San Francisco, CA",
    date: "July 20, 2025",
    time: "3:00 PM",
    duration: 240, // minutes
    latitude: 37.7835,
    longitude: -122.4071
  },
  {
    id: "job4",
    name: "Wilson Home",
    address: "321 Pine St, San Francisco, CA",
    date: "July 21, 2025",
    time: "10:00 AM",
    duration: 120, // minutes
    latitude: 37.7923,
    longitude: -122.4015
  },
  {
    id: "job5",
    name: "Apartment 4B",
    address: "555 Folsom St, San Francisco, CA",
    date: "July 21, 2025",
    time: "2:00 PM",
    duration: 150, // minutes
    latitude: 37.7857,
    longitude: -122.3954
  }
];

// Company office location
const officeLocation = {
  id: "office",
  name: "Office",
  address: "100 California St, San Francisco, CA",
  latitude: 37.7790,
  longitude: -122.4104
};

// Sample team members
const sampleTeamMembers = [
  {
    id: "team1",
    name: "Alice Johnson",
    avatar: null
  },
  {
    id: "team2",
    name: "Bob Williams",
    avatar: null
  },
  {
    id: "team3",
    name: "Carol Davis",
    avatar: null
  },
  {
    id: "team4",
    name: "David Wilson",
    avatar: null
  }
];

export default function RoutesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("optimize");
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-122.4104, 37.7790]);
  const [mapZoom, setMapZoom] = useState(12);

  // Handle route calculation
  const handleRouteCalculated = (route: any) => {
    setOptimizedRoute(route);
    
    // Center map on route
    if (route.points.length > 0) {
      // Calculate center of all points
      const lngs = route.points.map((point: any) => point.longitude);
      const lats = route.points.map((point: any) => point.latitude);
      
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;
      
      setMapCenter([centerLng, centerLat]);
      
      // Calculate appropriate zoom level
      const lngDiff = maxLng - minLng;
      const latDiff = maxLat - minLat;
      const maxDiff = Math.max(lngDiff, latDiff);
      
      if (maxDiff > 0.1) {
        setMapZoom(11);
      } else if (maxDiff > 0.05) {
        setMapZoom(12);
      } else {
        setMapZoom(13);
      }
    }
  };

  // Handle route sharing
  const handleShareRoute = () => {
    if (!optimizedRoute) return;
    setShareDialogOpen(true);
  };

  // Handle share result
  const handleShareResult = (result: { success: boolean; message: string }) => {
    if (result.success) {
      toast({
        title: "Route Shared",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Route Optimization | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="Route Optimization"
          text="Plan and optimize routes for your team"
          icon={<RouteIcon className="h-6 w-6 text-pink-500" />}
        >
          {optimizedRoute && (user?.role === "admin" || user?.role === "manager") && (
            <Button
              variant="outline"
              onClick={handleShareRoute}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Route
            </Button>
          )}
        </DashboardHeader>
        
        <div className="grid gap-6">
          <Tabs defaultValue="optimize" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="optimize">Optimize</TabsTrigger>
              <TabsTrigger value="view">View Route</TabsTrigger>
              <TabsTrigger value="shared">Shared Routes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="optimize" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <RouteOptimizer
                    locations={sampleJobs}
                    startLocation={officeLocation}
                    onRouteCalculated={handleRouteCalculated}
                    onShare={handleShareRoute}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Route Map</CardTitle>
                      <CardDescription>
                        Visualize the optimized route
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[500px] rounded-md overflow-hidden border">
                        <MapView
                          center={mapCenter}
                          zoom={mapZoom}
                          style={{ height: "100%" }}
                        >
                          {/* Render route if available */}
                          {optimizedRoute && optimizedRoute.points.length > 1 && (
                            <RouteVisualization
                              routeId="optimized-route"
                              points={optimizedRoute.points.map((point: any) => ({
                                longitude: point.longitude,
                                latitude: point.latitude,
                                name: point.name
                              }))}
                              color="#10B981" // Green color
                              lineWidth={4}
                              showMarkers={true}
                              animate={true}
                            />
                          )}
                        </MapView>
                      </div>
                      
                      {!optimizedRoute && (
                        <div className="text-center py-4 text-muted-foreground">
                          Use the optimizer to calculate a route
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {optimizedRoute && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Route Summary</CardTitle>
                    <CardDescription>
                      Details of the optimized route
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-pink-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Stops</div>
                            <div className="font-medium">{optimizedRoute.points.length}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <RouteIcon className="h-5 w-5 text-pink-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Total Distance</div>
                            <div className="font-medium">
                              {(optimizedRoute.totalDistance / 1000).toFixed(1)} km
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-pink-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">Total Duration</div>
                            <div className="font-medium">
                              {Math.floor(optimizedRoute.totalDuration / 60)} h {Math.round(optimizedRoute.totalDuration % 60)} min
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium mb-3">Route Itinerary</h4>
                        
                        <div className="space-y-3">
                          {optimizedRoute.points.map((point: any, index: number) => (
                            <div key={point.id} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  index === 0 ? "bg-green-100 text-green-800" : 
                                  index === optimizedRoute.points.length - 1 ? "bg-red-100 text-red-800" : 
                                  "bg-blue-100 text-blue-800"
                                }`}>
                                  {index + 1}
                                </div>
                                {index < optimizedRoute.points.length - 1 && (
                                  <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium">{point.name}</div>
                                <div className="text-sm text-muted-foreground">{point.address}</div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                  {point.arrivalTime && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Arrival: {new Date(point.arrivalTime).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </div>
                                  )}
                                  
                                  {point.duration && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Duration: {Math.floor(point.duration / 60)}h {point.duration % 60}m
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="view">
              <Card>
                <CardHeader>
                  <CardTitle>View Routes</CardTitle>
                  <CardDescription>
                    View and manage your saved routes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <RouteIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Saved Routes</h3>
                    <p className="max-w-md mx-auto mb-4">
                      You haven't saved any routes yet. Optimize a route and save it to view it here.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("optimize")}
                    >
                      Create a Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shared">
              <Card>
                <CardHeader>
                  <CardTitle>Shared Routes</CardTitle>
                  <CardDescription>
                    Routes that have been shared with you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Share2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Shared Routes</h3>
                    <p className="max-w-md mx-auto mb-4">
                      No routes have been shared with you yet. Routes shared by your manager will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardShell>
      
      {/* Route sharing dialog */}
      <RouteShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        route={optimizedRoute}
        teamMembers={sampleTeamMembers}
        onShare={handleShareResult}
      />
    </>
  );
}