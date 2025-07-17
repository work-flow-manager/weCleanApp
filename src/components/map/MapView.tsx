"use client";

import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map-styles.css";
import { Loader2 } from "lucide-react";
import { MapProvider } from "./MapContext";

interface MapViewProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  mapStyle?: string;
  interactive?: boolean;
  children?: React.ReactNode;
}

export default function MapView({
  center = [-74.5, 40], // Default to New York area
  zoom = 9,
  style = {},
  className = "",
  mapStyle = "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_key",
  interactive = true,
  children,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (!mapContainer.current) return; // Wait for the container to be available

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: center,
        zoom: zoom,
        interactive: interactive,
      });

      // Add navigation control (zoom buttons)
      if (interactive) {
        map.current.addControl(new maplibregl.NavigationControl(), "top-right");
      }

      // Add scale control
      map.current.addControl(
        new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
        "bottom-left"
      );

      // Set up event listeners
      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setError("Failed to load map. Please try again later.");
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please try again later.");
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, mapStyle, interactive]);

  // Create a context to provide the map instance to child components
  const mapContextValue = {
    map: map.current,
    mapLoaded,
  };

  return (
    <div
      className={`map-container ${className}`}
      style={{ minHeight: "400px", ...style }}
    >
      <div ref={mapContainer} className="absolute inset-0" />
      
      {!mapLoaded && !error && (
        <div className="map-loading-overlay">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="map-error-overlay">
          <div className="map-error-message">
            <p className="text-red-500 font-medium mb-2">Error</p>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      )}

      {/* Provide map context to children */}
      <MapProvider value={mapContextValue}>
        {/* Render children only when map is loaded */}
        {mapLoaded && children}
      </MapProvider>
    </div>
  );
}