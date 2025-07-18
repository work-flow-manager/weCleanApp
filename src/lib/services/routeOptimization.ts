/**
 * Route Optimization Service
 * 
 * This service provides algorithms and utilities for optimizing routes between job locations.
 * It includes implementations of common routing algorithms like nearest neighbor and 2-opt.
 */

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  duration?: number; // estimated time to complete job in minutes
}

export interface RoutePoint extends Location {
  arrivalTime?: string; // ISO string
  departureTime?: string; // ISO string
  distanceFromPrevious?: number; // in meters
  travelTimeFromPrevious?: number; // in minutes
}

export interface RouteResult {
  points: RoutePoint[];
  totalDistance: number; // in meters
  totalDuration: number; // in minutes (includes job durations)
  totalTravelTime: number; // in minutes (travel time only)
}

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
}

/**
 * Calculate estimated travel time between two points
 * @param distance Distance in meters
 * @param averageSpeed Average speed in km/h
 * @returns Travel time in minutes
 */
export function calculateTravelTime(distance: number, averageSpeed: number = 30): number {
  // Convert distance from meters to kilometers
  const distanceKm = distance / 1000;
  // Calculate time in hours
  const timeHours = distanceKm / averageSpeed;
  // Convert to minutes
  return timeHours * 60;
}

/**
 * Optimize route using the Nearest Neighbor algorithm
 * @param locations Array of locations
 * @param startLocationIndex Index of the starting location (default: 0)
 * @param endLocationIndex Index of the ending location (default: same as start)
 * @param startTime ISO string of the start time (default: current time)
 * @param averageSpeed Average speed in km/h (default: 30)
 * @returns Optimized route
 */
export function optimizeRouteNearestNeighbor(
  locations: Location[],
  startLocationIndex: number = 0,
  endLocationIndex: number = startLocationIndex,
  startTime: string = new Date().toISOString(),
  averageSpeed: number = 30
): RouteResult {
  if (locations.length === 0) {
    return { points: [], totalDistance: 0, totalDuration: 0, totalTravelTime: 0 };
  }

  if (locations.length === 1) {
    const point: RoutePoint = {
      ...locations[0],
      arrivalTime: startTime,
      departureTime: startTime,
      distanceFromPrevious: 0,
      travelTimeFromPrevious: 0
    };
    return {
      points: [point],
      totalDistance: 0,
      totalDuration: locations[0].duration || 0,
      totalTravelTime: 0
    };
  }

  // Create a copy of locations to work with
  const unvisited = [...locations];
  
  // Extract start location
  const startLocation = unvisited.splice(startLocationIndex, 1)[0];
  
  // Initialize route with start location
  const route: RoutePoint[] = [{
    ...startLocation,
    arrivalTime: startTime,
    departureTime: startTime,
    distanceFromPrevious: 0,
    travelTimeFromPrevious: 0
  }];
  
  let currentLocation = startLocation;
  let currentTime = new Date(startTime);
  
  // Add job duration to current time
  if (currentLocation.duration) {
    currentTime.setMinutes(currentTime.getMinutes() + currentLocation.duration);
  }
  
  let totalDistance = 0;
  let totalTravelTime = 0;
  
  // Find nearest neighbor for each remaining location
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;
    
    // Find the nearest unvisited location
    for (let i = 0; i < unvisited.length; i++) {
      const location = unvisited[i];
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.latitude,
        location.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add the nearest location to the route
    const nextLocation = unvisited.splice(nearestIndex, 1)[0];
    
    // Calculate travel time
    const travelTime = calculateTravelTime(minDistance, averageSpeed);
    
    // Update current time with travel time
    currentTime.setMinutes(currentTime.getMinutes() + travelTime);
    
    // Add to route
    const arrivalTime = new Date(currentTime).toISOString();
    
    // Add job duration to current time
    if (nextLocation.duration) {
      currentTime.setMinutes(currentTime.getMinutes() + nextLocation.duration);
    }
    
    const departureTime = new Date(currentTime).toISOString();
    
    route.push({
      ...nextLocation,
      arrivalTime,
      departureTime,
      distanceFromPrevious: minDistance,
      travelTimeFromPrevious: travelTime
    });
    
    // Update totals
    totalDistance += minDistance;
    totalTravelTime += travelTime;
    
    // Update current location
    currentLocation = nextLocation;
  }
  
  // If end location is different from start, add it to the route
  if (endLocationIndex !== startLocationIndex && endLocationIndex < locations.length) {
    const endLocation = locations[endLocationIndex];
    
    // Calculate distance and travel time to end location
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      endLocation.latitude,
      endLocation.longitude
    );
    
    const travelTime = calculateTravelTime(distance, averageSpeed);
    
    // Update current time with travel time
    currentTime.setMinutes(currentTime.getMinutes() + travelTime);
    
    // Add to route
    route.push({
      ...endLocation,
      arrivalTime: currentTime.toISOString(),
      departureTime: currentTime.toISOString(),
      distanceFromPrevious: distance,
      travelTimeFromPrevious: travelTime
    });
    
    // Update totals
    totalDistance += distance;
    totalTravelTime += travelTime;
  }
  
  // Calculate total duration (travel time + job durations)
  const totalDuration = totalTravelTime + locations.reduce((sum, location) => sum + (location.duration || 0), 0);
  
  return {
    points: route,
    totalDistance,
    totalDuration,
    totalTravelTime
  };
}

/**
 * Optimize route using the 2-opt algorithm
 * This algorithm improves on the nearest neighbor solution by swapping pairs of edges
 * @param locations Array of locations
 * @param startLocationIndex Index of the starting location (default: 0)
 * @param endLocationIndex Index of the ending location (default: same as start)
 * @param startTime ISO string of the start time (default: current time)
 * @param averageSpeed Average speed in km/h (default: 30)
 * @param maxIterations Maximum number of iterations (default: 100)
 * @returns Optimized route
 */
export function optimizeRoute2Opt(
  locations: Location[],
  startLocationIndex: number = 0,
  endLocationIndex: number = startLocationIndex,
  startTime: string = new Date().toISOString(),
  averageSpeed: number = 30,
  maxIterations: number = 100
): RouteResult {
  // First get a route using nearest neighbor
  const nnResult = optimizeRouteNearestNeighbor(
    locations,
    startLocationIndex,
    endLocationIndex,
    startTime,
    averageSpeed
  );
  
  if (locations.length <= 3) {
    // 2-opt doesn't make sense for 3 or fewer locations
    return nnResult;
  }
  
  // Extract the route points
  let route = [...nnResult.points];
  
  // Keep track of the best distance
  let bestDistance = nnResult.totalDistance;
  let improved = true;
  let iterations = 0;
  
  // Continue until no improvement is found or max iterations reached
  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    
    // Try all possible edge swaps
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length - 1; j++) {
        // Skip if i and j are adjacent
        if (j === i + 1) continue;
        
        // Calculate current distance
        const d1 = calculateDistance(
          route[i-1].latitude,
          route[i-1].longitude,
          route[i].latitude,
          route[i].longitude
        );
        
        const d2 = calculateDistance(
          route[j].latitude,
          route[j].longitude,
          route[j+1].latitude,
          route[j+1].longitude
        );
        
        // Calculate new distance if edges are swapped
        const d3 = calculateDistance(
          route[i-1].latitude,
          route[i-1].longitude,
          route[j].latitude,
          route[j].longitude
        );
        
        const d4 = calculateDistance(
          route[i].latitude,
          route[i].longitude,
          route[j+1].latitude,
          route[j+1].longitude
        );
        
        // If new distance is shorter, swap edges
        if (d1 + d2 > d3 + d4) {
          // Reverse the segment between i and j
          const newRoute = [
            ...route.slice(0, i),
            ...route.slice(i, j + 1).reverse(),
            ...route.slice(j + 1)
          ];
          
          // Recalculate the entire route
          let currentTime = new Date(startTime);
          let totalDistance = 0;
          let totalTravelTime = 0;
          
          for (let k = 1; k < newRoute.length; k++) {
            const prevLocation = newRoute[k-1];
            const currentLocation = newRoute[k];
            
            // Add job duration to current time
            if (prevLocation.duration) {
              currentTime.setMinutes(currentTime.getMinutes() + prevLocation.duration);
            }
            
            // Calculate distance and travel time
            const distance = calculateDistance(
              prevLocation.latitude,
              prevLocation.longitude,
              currentLocation.latitude,
              currentLocation.longitude
            );
            
            const travelTime = calculateTravelTime(distance, averageSpeed);
            
            // Update current time with travel time
            currentTime.setMinutes(currentTime.getMinutes() + travelTime);
            
            // Update route point
            newRoute[k] = {
              ...currentLocation,
              arrivalTime: new Date(currentTime).toISOString(),
              departureTime: new Date(currentTime).toISOString(),
              distanceFromPrevious: distance,
              travelTimeFromPrevious: travelTime
            };
            
            // Update totals
            totalDistance += distance;
            totalTravelTime += travelTime;
          }
          
          // If new route is better, keep it
          if (totalDistance < bestDistance) {
            route = newRoute;
            bestDistance = totalDistance;
            improved = true;
            
            // Calculate total duration
            const totalDuration = totalTravelTime + locations.reduce((sum, location) => sum + (location.duration || 0), 0);
            
            // Return early if we found a significant improvement
            if (bestDistance < nnResult.totalDistance * 0.8) {
              return {
                points: route,
                totalDistance: bestDistance,
                totalDuration,
                totalTravelTime
              };
            }
          }
        }
      }
    }
  }
  
  // Calculate total duration
  const totalDuration = nnResult.totalTravelTime + locations.reduce((sum, location) => sum + (location.duration || 0), 0);
  
  return {
    points: route,
    totalDistance: bestDistance,
    totalDuration,
    totalTravelTime: nnResult.totalTravelTime
  };
}

/**
 * Format distance for display
 * @param distance Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  } else {
    return `${(distance / 1000).toFixed(1)} km`;
  }
}

/**
 * Format duration for display
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours} h ${mins} min`;
  }
}

/**
 * Format time for display
 * @param isoString ISO time string
 * @returns Formatted time string (e.g., "9:30 AM")
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}