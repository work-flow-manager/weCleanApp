"use client";

import React, { createContext, useContext } from "react";
import maplibregl from "maplibre-gl";

interface MapContextType {
  map: maplibregl.Map | null;
  mapLoaded: boolean;
}

const MapContext = createContext<MapContextType>({
  map: null,
  mapLoaded: false,
});

export const useMap = () => useContext(MapContext);

interface MapProviderProps {
  value: MapContextType;
  children: React.ReactNode;
}

export function MapProvider({ value, children }: MapProviderProps) {
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}