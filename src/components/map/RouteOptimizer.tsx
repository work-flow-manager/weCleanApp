"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Route as RouteIcon, Share2, Clock, MapPin, Car } from "lucide-react";
import { formatDistance, formatDuration, formatTime } from "@/lib/services/routeOptimization";
import { useAuth } from "@/contexts/AuthContext";

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  duration?: number;
}

interface RoutePoint extends Location {
  arrivalTime?: string;
  departureTime?: string;
  distanceFromPrevious?: number;
  travelTimeFromPrevious?: number;
}

interface RouteResult {
  points: RoutePoint[];
  totalDistance: number;
  totalDuration: number;
  totalTravelTime: number;
}

interface RouteOptimizerProps {
  locations: Location[];
  startLocation?: Location;
  onRouteCalculated?: (route: RouteResult) => void;
  onShare?: (route: RouteResult) => void;
  className?: string;
}

export default function RouteOptimizer({
  locations,
  startLocation,
  onRouteCalculated,
  onShare,
  className = "",
}: RouteOptimizerProps) {
  const { user } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [algorithm, setAlgorithm] = useState<string>("2opt");
  const [averageSpeed, setAverageSpeed] = useState<number>(30);
  const [startTime, setStartTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [includeStartLocation, setIncludeStartLocation] = useState<boolean>(!!startLocation);
  const [returnToStart, setReturnToStart] = useState<boolean>(false);

  // Calculate route
  const calculateRoute = async () => {
    if (locations.length === 0) {
      toast({
        title: "Cannot calculate route",
        description: "No locations provided",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Prepare locations array
      let routeLocations = [...locations];
      let startLocationIndex = 0;
      let endLocationIndex = returnToStart ? 0 : routeLocations.length - 1;

      // Add start location if provided and selected
      if (startLocation && includeStartLocation) {
        routeLocations = [startLocation, ...routeLocations];
        startLocationIndex = 0;
        endLocationIndex = returnToStart ? 0 : routeLocations.length - 1;
      }

      // Convert start time to ISO string
      const startTimeISO = new Date(startTime).toISOString();

      // Call API to optimize route
      const response = await fetch("/api/routes/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations: routeLocations,
          startLocationIndex,
          endLocationIndex: returnToStart ? startLocationIndex : endLocationIndex,
          startTime: startTimeISO,
          algorithm,
          averageSpeed,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to optimize route");
      }

      const data = await response.json();
      const optimizedRoute = data.route;

      setRoute(optimizedRoute);

      if (onRouteCalculated) {
        onRouteCalculated(optimizedRoute);
      }

      toast({
        title: "Route Optimized",
        description: `Total distance: ${formatDistance(optimizedRoute.totalDistance)}`,
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      toast({
        title: "Error",
        description: "Failed to calculate route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Share route
  const shareRoute = async () => {
    if (!route) return;

    if (!onShare) {
      // If no onShare callback provided, copy route to clipboard
      try {
        const routeText = JSON.stringify(route, null, 2);
        await navigator.clipboard.writeText(routeText);
        toast({
          title: "Route Copied",
          description: "Route data copied to clipboard",
        });
      } catch (error) {
        console.error("Error copying route:", error);
        toast({
          title: "Error",
          description: "Failed to copy route to clipboard",
          variant: "destructive",
        });
      }
    } else {
      onShare(route);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RouteIcon className="h-5 w-5 text-pink-500" />
          Route Optimizer
        </CardTitle>
        <CardDescription>
          Calculate the most efficient route between locations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
              >
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest Neighbor</SelectItem>
                  <SelectItem value="2opt">2-Opt (More Efficient)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="average-speed">Average Speed: {averageSpeed} km/h</Label>
            </div>
            <Slider
              id="average-speed"
              min={10}
              max={80}
              step={5}
              value={[averageSpeed]}
              onValueChange={(value) => setAverageSpeed(value[0])}
            />
          </div>
          
          {startLocation && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pink-500" />
                <Label htmlFor="include-start">Include start location</Label>
              </div>
              <Switch
                id="include-start"
                checked={includeStartLocation}
                onCheckedChange={setIncludeStartLocation}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-pink-500" />
              <Label htmlFor="return-to-start">Return to start</Label>
            </div>
            <Switch
              id="return-to-start"
              checked={returnToStart}
              onCheckedChange={setReturnToStart}
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="default"
            onClick={calculateRoute}
            disabled={isCalculating || locations.length === 0}
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RouteIcon className="mr-2 h-4 w-4" />
                Optimize Route
              </>
            )}
          </Button>
          
          {route && (
            <Button
              variant="outline"
              onClick={shareRoute}
              disabled={isCalculating}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Route
            </Button>
          )}
        </div>
        
        {route && (
          <div className="mt-4 space-y-4">
            <Separator />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Distance</div>
                <div className="font-medium">{formatDistance(route.totalDistance)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Travel Time</div>
                <div className="font-medium">{formatDuration(route.totalTravelTime)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Duration</div>
                <div className="font-medium">{formatDuration(route.totalDuration)}</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Route Details</h4>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {route.points.map((point, index) => (
                  <div key={point.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0 ? "bg-green-100 text-green-800" : 
                        index === route.points.length - 1 ? "bg-red-100 text-red-800" : 
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {index + 1}
                      </div>
                      {index < route.points.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium">{point.name}</div>
                      
                      {point.arrivalTime && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Arrival: {formatTime(point.arrivalTime)}
                        </div>
                      )}
                      
                      {index > 0 && point.distanceFromPrevious && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Car className="h-3 w-3 mr-1" />
                          {formatDistance(point.distanceFromPrevious)}
                          {point.travelTimeFromPrevious && (
                            <span className="ml-1">
                              ({formatDuration(point.travelTimeFromPrevious)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}