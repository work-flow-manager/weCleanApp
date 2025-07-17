"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { JobUpdate } from "@/types/job";
import { format } from "date-fns";

interface JobHistoryTimelineProps {
  updates: JobUpdate[];
  className?: string;
}

export function JobHistoryTimeline({ updates, className }: JobHistoryTimelineProps) {
  // Sort updates by date (newest first)
  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const statusColors: Record<string, string> = {
    scheduled: "bg-amber-100 text-amber-800 border-amber-200",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    issue: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Card className={`backdrop-blur-sm bg-white/40 border border-pink-200/50 ${className}`}>
      <CardHeader>
        <CardTitle>Job History</CardTitle>
        <CardDescription>Timeline of job updates and status changes</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedUpdates.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-100"></div>
            
            {/* Timeline events */}
            <div className="space-y-6">
              {sortedUpdates.map((update, index) => (
                <div key={update.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                  </div>
                  
                  {/* Event content */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-pink-100/50 p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-pink-100 text-pink-500 text-xs">
                            {update.profiles?.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{update.profiles?.full_name || "User"}</p>
                          <p className="text-xs text-gray-500">{format(new Date(update.created_at), "PPP 'at' p")}</p>
                        </div>
                      </div>
                      {update.status && (
                        <Badge className={statusColors[update.status]}>
                          {update.status.charAt(0).toUpperCase() + update.status.slice(1).replace("-", " ")}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{update.notes}</p>
                    
                    {/* Location data if available */}
                    {update.location && (
                      <div className="mt-2 text-xs text-gray-500">
                        Location: {update.location.latitude.toFixed(6)}, {update.location.longitude.toFixed(6)}
                      </div>
                    )}
                    
                    {/* Photos if available */}
                    {update.photos && update.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {update.photos.map((photo, photoIndex) => (
                          <div key={photoIndex} className="aspect-square rounded-md overflow-hidden">
                            <img 
                              src={photo} 
                              alt={`Update photo ${photoIndex + 1}`} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No job history available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}