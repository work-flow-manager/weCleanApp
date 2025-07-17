"use client";

import React from "react";
import LocationMarker from "./LocationMarker";

interface TeamMemberMarkerProps {
  memberId: string;
  name: string;
  avatar?: string;
  longitude: number;
  latitude: number;
  lastUpdated?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function TeamMemberMarker({
  memberId,
  name,
  avatar,
  longitude,
  latitude,
  lastUpdated,
  isActive = true,
  onClick,
}: TeamMemberMarkerProps) {
  // Create popup content
  const popupContent = `
    <div class="p-2">
      <div class="flex items-center gap-2 mb-2">
        ${avatar ? 
          `<img src="${avatar}" alt="${name}" class="w-8 h-8 rounded-full object-cover" />` : 
          `<div class="w-8 h-8 rounded-full bg-pink-200 text-pink-800 flex items-center justify-center font-medium">
            ${name.split(" ").map(n => n[0]).join("")}
          </div>`
        }
        <h3 class="font-medium text-gray-900">${name}</h3>
      </div>
      ${lastUpdated ? 
        `<div class="text-xs text-gray-500 mb-1">
          Last updated: ${lastUpdated}
        </div>` : 
        ''
      }
      <div class="mt-1">
        <span class="inline-block px-2 py-1 text-xs rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }">
          ${isActive ? 'Active' : 'Inactive'}
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
      color="#10B981" // Green for team members
      size={24}
      popup={popupContent}
      onClick={onClick}
      className="team-marker"
      pulseEffect={isActive}
    />
  );
}