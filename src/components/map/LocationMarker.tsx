"use client";

import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMap } from "./MapContext";

interface LocationMarkerProps {
  longitude: number;
  latitude: number;
  color?: string;
  size?: number;
  popup?: string | React.ReactNode;
  onClick?: () => void;
  className?: string;
  pulseEffect?: boolean;
}

export default function LocationMarker({
  longitude,
  latitude,
  color = "#EC4899", // Pink-500 from the design system
  size = 30,
  popup,
  onClick,
  className = "",
  pulseEffect = false,
}: LocationMarkerProps) {
  const { map, mapLoaded } = useMap();
  const [marker, setMarker] = useState<maplibregl.Marker | null>(null);
  const [popupInstance, setPopupInstance] = useState<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Create marker element
    const el = document.createElement("div");
    el.className = `marker ${className} ${pulseEffect ? "pulse" : ""}`;
    el.style.backgroundColor = color;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.borderRadius = "50%";
    el.style.cursor = "pointer";
    
    if (pulseEffect) {
      el.style.boxShadow = `0 0 0 rgba(${hexToRgb(color)}, 0.4)`;
      el.style.animation = "pulse 2s infinite";
    }

    // Create popup if provided
    let popupObj = null;
    if (popup) {
      popupObj = new maplibregl.Popup({ offset: 25, closeButton: false })
        .setHTML(typeof popup === "string" ? popup : "");
      
      setPopupInstance(popupObj);
    }

    // Create and add the marker
    const newMarker = new maplibregl.Marker(el)
      .setLngLat([longitude, latitude]);
    
    if (popupObj) {
      newMarker.setPopup(popupObj);
    }
    
    newMarker.addTo(map);
    setMarker(newMarker);

    // Add click handler
    if (onClick) {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick();
      });
    }

    // Clean up on unmount
    return () => {
      if (newMarker) {
        newMarker.remove();
      }
    };
  }, [map, mapLoaded, longitude, latitude, color, size, popup, onClick, className, pulseEffect]);

  // Update marker position if coordinates change
  useEffect(() => {
    if (marker) {
      marker.setLngLat([longitude, latitude]);
    }
  }, [marker, longitude, latitude]);

  // Helper function to convert hex color to RGB
  function hexToRgb(hex: string): string {
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
  }

  return null; // This component doesn't render anything directly
}