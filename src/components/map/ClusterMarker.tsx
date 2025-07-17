"use client";

import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMap } from "./MapContext";

interface ClusterMarkerProps {
  sourceId: string;
  color?: string;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  onClick?: (clusterId: number, coordinates: [number, number]) => void;
}

export default function ClusterMarker({
  sourceId,
  color = "#EC4899", // Pink-500 from the design system
  clusterRadius = 50,
  clusterMaxZoom = 14,
  onClick,
}: ClusterMarkerProps) {
  const { map, mapLoaded } = useMap();
  const [sourceAdded, setSourceAdded] = useState(false);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Check if source already exists
    if (map.getSource(sourceId)) {
      setSourceAdded(true);
      return;
    }

    // Add source for clustering
    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
      cluster: true,
      clusterMaxZoom,
      clusterRadius,
    });

    // Add cluster layer
    map.addLayer({
      id: `${sourceId}-clusters`,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": color,
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20, // radius for point count 0-9
          10,
          30, // radius for point count 10-49
          50,
          40, // radius for point count 50+
        ],
        "circle-opacity": 0.8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "white",
      },
    });

    // Add cluster count layer
    map.addLayer({
      id: `${sourceId}-cluster-count`,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
      paint: {
        "text-color": "white",
      },
    });

    // Add unclustered point layer
    map.addLayer({
      id: `${sourceId}-unclustered-point`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": color,
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "white",
      },
    });

    // Add click event for clusters
    if (onClick) {
      map.on("click", `${sourceId}-clusters`, (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [`${sourceId}-clusters`],
        });
        
        if (features.length > 0) {
          const clusterId = features[0].properties?.cluster_id;
          const coordinates = (features[0].geometry as any).coordinates as [number, number];
          
          if (clusterId) {
            onClick(clusterId, coordinates);
          }
        }
      });

      // Change cursor on hover
      map.on("mouseenter", `${sourceId}-clusters`, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      
      map.on("mouseleave", `${sourceId}-clusters`, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    setSourceAdded(true);

    // Clean up on unmount
    return () => {
      if (map && map.getSource(sourceId)) {
        map.removeLayer(`${sourceId}-clusters`);
        map.removeLayer(`${sourceId}-cluster-count`);
        map.removeLayer(`${sourceId}-unclustered-point`);
        map.removeSource(sourceId);
      }
    };
  }, [map, mapLoaded, sourceId, color, clusterRadius, clusterMaxZoom, onClick]);

  // Method to update the source data
  const updateSourceData = (features: any[]) => {
    if (!map || !sourceAdded) return;
    
    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features,
      });
    }
  };

  // Expose the updateSourceData method
  React.useImperativeHandle(
    React.createRef(),
    () => ({
      updateSourceData,
    })
  );

  return null; // This component doesn't render anything directly
}