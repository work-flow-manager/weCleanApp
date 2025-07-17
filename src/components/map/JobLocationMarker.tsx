"use client";

import React from "react";
import LocationMarker from "./LocationMarker";
import { MapPin, Calendar, Clock, User } from "lucide-react";

interface JobLocationMarkerProps {
  jobId: string;
  title: string;
  address: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "issue";
  customer: string;
  longitude: number;
  latitude: number;
  onClick?: () => void;
}

export default function JobLocationMarker({
  jobId,
  title,
  address,
  date,
  time,
  status,
  customer,
  longitude,
  latitude,
  onClick,
}: JobLocationMarkerProps) {
  // Get color based on job status
  const getStatusColor = () => {
    switch (status) {
      case "scheduled":
        return "#3B82F6"; // Blue
      case "in-progress":
        return "#F59E0B"; // Amber
      case "completed":
        return "#10B981"; // Green
      case "cancelled":
        return "#6B7280"; // Gray
      case "issue":
        return "#EF4444"; // Red
      default:
        return "#3B82F6"; // Default blue
    }
  };

  // Create popup content
  const popupContent = `
    <div class="p-2">
      <h3 class="font-medium text-gray-900 mb-1">${title}</h3>
      <div class="text-sm text-gray-600 mb-1">
        <div class="flex items-center gap-1 mb-1">
          <span class="flex-shrink-0">📍</span>
          <span>${address}</span>
        </div>
        <div class="flex items-center gap-1 mb-1">
          <span class="flex-shrink-0">📅</span>
          <span>${date} at ${time}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="flex-shrink-0">👤</span>
          <span>${customer}</span>
        </div>
      </div>
      <div class="mt-2">
        <span class="inline-block px-2 py-1 text-xs rounded-full bg-opacity-20" 
              style="background-color: ${getStatusColor()}20; color: ${getStatusColor()}">
          ${status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
        </span>
      </div>
      <div class="mt-2 text-xs text-center text-pink-500">
        Click for details
      </div>
    </div>
  `;

  return (
    <LocationMarker
      longitude={longitude}
      latitude={latitude}
      color={getStatusColor()}
      size={24}
      popup={popupContent}
      onClick={onClick}
      className="job-marker"
      pulseEffect={status === "in-progress"}
    />
  );
}