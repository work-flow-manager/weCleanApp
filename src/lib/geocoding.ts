/**
 * Utility functions for geocoding addresses to coordinates
 */

interface GeocodingResult {
  longitude: number;
  latitude: number;
  formattedAddress?: string;
  confidence?: number;
}

/**
 * Geocode an address to coordinates using a geocoding service
 * This is a placeholder implementation - in a real application,
 * you would integrate with a geocoding service like MapBox, Google Maps, etc.
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    // In a real implementation, you would call a geocoding API here
    // For example:
    // const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=YOUR_MAPBOX_TOKEN`);
    // const data = await response.json();
    // return {
    //   longitude: data.features[0].center[0],
    //   latitude: data.features[0].center[1],
    //   formattedAddress: data.features[0].place_name,
    //   confidence: data.features[0].relevance
    // };

    // For now, return a mock result based on the address string
    // This is just for demonstration purposes
    const hash = simpleHash(address);
    const longitude = -74.0 + (hash % 100) / 1000;
    const latitude = 40.7 + (hash % 100) / 1000;

    return {
      longitude,
      latitude,
      formattedAddress: address,
      confidence: 0.9,
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to an address
 * This is a placeholder implementation
 */
export async function reverseGeocode(
  longitude: number,
  latitude: number
): Promise<string | null> {
  try {
    // In a real implementation, you would call a reverse geocoding API here
    // For now, return a mock result
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Simple string hash function for demo purposes
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}