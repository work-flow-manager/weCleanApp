"use client";

import React, { useEffect, useState, forwardRef } from "react";
import maplibregl from "maplibre-gl";
import { useMap } from "./MapContext";

interface ClusterMarkerProps {
  sourceId: string;
  color?: string;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  onClick?: (clusterId: number, coordinates: [number, number]) => void;
}

const ClusterMarker = forwardRef<any, ClusterMarkerProps>(({
  sourceId,
  color = "#EC4899", // Pink-500 from the design system
  clusterRadius = 50,
  clusterMaxZoom = 14,
  onClick,
}, ref) => {
  const { map } = useMap();
  const [sourceAdded, setSourceAdded] = useState(false);

  useEffect(() => {
    if (!map || sourceAdded) return;

    // Add a source for job clusters
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

    // Add a layer for the clusters
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
          20, // Size for clusters with < 10 points
          10, 30, // Size for clusters with < 30 points
          30, 40, // Size for clusters with >= 30 points
        ],
        "circle-opacity": 0.8,
      },
    });

    // Add a layer for the cluster count labels
    map.addLayer({
      id: `${sourceId}-cluster-count`,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 14,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    // Add a layer for unclustered points
    map.addLayer({
      id: `${sourceId}-unclustered-point`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": color,
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    // Handle cluster click
    if (onClick) {
      map.on("click", `${sourceId}-clusters`, (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [`${sourceId}-clusters`],
        });
        
        if (features.length > 0) {
          const clusterId = features[0].properties?.cluster_id;
          // Type assertion to handle the geometry type
          const point = features[0].geometry as GeoJSON.Point;
          const coordinates = point.coordinates as [number, number];
          
          onClick(clusterId, coordinates);
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

    // Expose the source ID through the ref
    if (ref && typeof ref === 'object') {
      ref.current = {
        sourceId,
        updateSource: (data: any) => {
          if (map.getSource(sourceId)) {
            (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data);
          }
        }
      };
    }

    // Cleanup
    return () => {
      if (map && map.getLayer(`${sourceId}-clusters`)) {
        map.removeLayer(`${sourceId}-clusters`);
        map.removeLayer(`${sourceId}-cluster-count`);
        map.removeLayer(`${sourceId}-unclustered-point`);
        map.removeSource(sourceId);
      }
    };
  }, [map, sourceId, color, clusterRadius, clusterMaxZoom, onClick, sourceAdded, ref]);

  return null;
});

ClusterMarker.displayName = "ClusterMarker";

export default ClusterMarker;