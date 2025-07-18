"use client";

import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMap } from "./MapContext";

interface RoutePoint {
  longitude: number;
  latitude: number;
  name?: string;
}

interface RouteVisualizationProps {
  routeId: string;
  points: RoutePoint[];
  color?: string;
  lineWidth?: number;
  showMarkers?: boolean;
  animate?: boolean;
  dashArray?: number[];
}

export default function RouteVisualization({
  routeId,
  points,
  color = "#EC4899", // Pink-500 from the design system
  lineWidth = 4,
  showMarkers = true,
  animate = false,
  dashArray,
}: RouteVisualizationProps) {
  const { map, mapLoaded } = useMap();
  const [sourceAdded, setSourceAdded] = useState(false);

  useEffect(() => {
    if (!map || !mapLoaded || points.length < 2) return;

    // Create GeoJSON data for the route
    const routeData = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: points.map(point => [point.longitude, point.latitude]),
      },
    };

    // Create GeoJSON data for the markers
    const markersData = {
      type: "FeatureCollection",
      features: points.map((point, index) => ({
        type: "Feature",
        properties: {
          name: point.name || `Point ${index + 1}`,
          index,
          isFirst: index === 0,
          isLast: index === points.length - 1,
        },
        geometry: {
          type: "Point",
          coordinates: [point.longitude, point.latitude],
        },
      })),
    };

    // Add route source if it doesn't exist
    if (!map.getSource(`${routeId}-route`)) {
      map.addSource(`${routeId}-route`, {
        type: "geojson",
        data: routeData as any,
      });
    } else {
      // Update existing source
      (map.getSource(`${routeId}-route`) as maplibregl.GeoJSONSource).setData(
        routeData as any
      );
    }

    // Add markers source if it doesn't exist and markers are enabled
    if (showMarkers && !map.getSource(`${routeId}-markers`)) {
      map.addSource(`${routeId}-markers`, {
        type: "geojson",
        data: markersData as any,
      });
    } else if (showMarkers) {
      // Update existing source
      (map.getSource(`${routeId}-markers`) as maplibregl.GeoJSONSource).setData(
        markersData as any
      );
    }

    // Add route layer if it doesn't exist
    if (!map.getLayer(`${routeId}-route-layer`)) {
      map.addLayer({
        id: `${routeId}-route-layer`,
        type: "line",
        source: `${routeId}-route`,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": lineWidth,
          "line-dasharray": dashArray,
          "line-opacity": 0.8,
        },
      });

      // Add animation if enabled
      if (animate) {
        const lineDashArraySequence = [
          [0, 4, 3],
          [0.5, 4, 2.5],
          [1, 4, 2],
          [1.5, 4, 1.5],
          [2, 4, 1],
          [2.5, 4, 0.5],
          [3, 4, 0],
          [0, 0.5, 3, 3.5],
          [0, 1, 3, 3],
          [0, 1.5, 3, 2.5],
          [0, 2, 3, 2],
          [0, 2.5, 3, 1.5],
          [0, 3, 3, 1],
          [0, 3.5, 3, 0.5],
        ];

        let step = 0;

        const animateDashArray = () => {
          if (!map.getLayer(`${routeId}-route-layer`)) return;
          
          const dashArray = lineDashArraySequence[step];
          step = (step + 1) % lineDashArraySequence.length;
          
          map.setPaintProperty(
            `${routeId}-route-layer`,
            "line-dasharray",
            dashArray
          );
          
          requestAnimationFrame(animateDashArray);
        };

        animateDashArray();
      }
    } else {
      // Update existing layer
      map.setPaintProperty(`${routeId}-route-layer`, "line-color", color);
      map.setPaintProperty(`${routeId}-route-layer`, "line-width", lineWidth);
      if (dashArray) {
        map.setPaintProperty(`${routeId}-route-layer`, "line-dasharray", dashArray);
      }
    }

    // Add marker layers if they don't exist and markers are enabled
    if (showMarkers && !map.getLayer(`${routeId}-markers-layer`)) {
      // Add circle layer for markers
      map.addLayer({
        id: `${routeId}-markers-layer`,
        type: "circle",
        source: `${routeId}-markers`,
        paint: {
          "circle-radius": [
            "case",
            ["any", ["==", ["get", "isFirst"], true], ["==", ["get", "isLast"], true]],
            8, // Larger radius for first and last points
            6, // Normal radius for waypoints
          ],
          "circle-color": [
            "case",
            ["==", ["get", "isFirst"], true],
            "#10B981", // Green for start
            ["==", ["get", "isLast"], true],
            "#EF4444", // Red for end
            "#3B82F6", // Blue for waypoints
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "white",
        },
      });

      // Add labels for markers
      map.addLayer({
        id: `${routeId}-markers-labels`,
        type: "symbol",
        source: `${routeId}-markers`,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-offset": [0, -1.5],
          "text-anchor": "bottom",
        },
        paint: {
          "text-color": "#1F2937",
          "text-halo-color": "white",
          "text-halo-width": 1,
        },
      });
    }

    setSourceAdded(true);

    // Clean up on unmount
    return () => {
      if (map) {
        if (map.getLayer(`${routeId}-markers-labels`)) {
          map.removeLayer(`${routeId}-markers-labels`);
        }
        if (map.getLayer(`${routeId}-markers-layer`)) {
          map.removeLayer(`${routeId}-markers-layer`);
        }
        if (map.getLayer(`${routeId}-route-layer`)) {
          map.removeLayer(`${routeId}-route-layer`);
        }
        if (map.getSource(`${routeId}-markers`)) {
          map.removeSource(`${routeId}-markers`);
        }
        if (map.getSource(`${routeId}-route`)) {
          map.removeSource(`${routeId}-route`);
        }
      }
    };
  }, [map, mapLoaded, routeId, points, color, lineWidth, showMarkers, animate, dashArray]);

  return null; // This component doesn't render anything directly
}