"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Calendar, XCircle } from "lucide-react";
import { JobStatus } from "@/types/job";
import { format } from "date-fns";

interface StatusStep {
  status: JobStatus;
  label: string;
  icon: React.ReactNode;
  date?: Date;
  color: string;
}

interface JobStatusTimelineProps {
  currentStatus: JobStatus;
  statusHistory: Array<{
    status: JobStatus;
    date: string;
  }>;
  className?: string;
}

export function JobStatusTimeline({ currentStatus, statusHistory, className }: JobStatusTimelineProps) {
  // Define all possible statuses in order
  const allStatuses: StatusStep[] = [
    {
      status: "scheduled",
      label: "Scheduled",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-amber-500",
    },
    {
      status: "in-progress",
      label: "In Progress",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-blue-500",
    },
    {
      status: "completed",
      label: "Completed",
      icon: <CheckCircle className="h-5 w-5" />,
      color: "bg-green-500",
    },
  ];

  // Special statuses that break the normal flow
  const specialStatuses: Record<string, StatusStep> = {
    cancelled: {
      status: "cancelled",
      label: "Cancelled",
      icon: <XCircle className="h-5 w-5" />,
      color: "bg-gray-500",
    },
    issue: {
      status: "issue",
      label: "Issue Reported",
      icon: <AlertCircle className="h-5 w-5" />,
      color: "bg-red-500",
    },
  };

  // Add dates to statuses from history
  const statusDates: Record<string, Date> = {};
  statusHistory.forEach(item => {
    statusDates[item.status] = new Date(item.date);
  });

  // Update status steps with dates
  allStatuses.forEach(step => {
    if (statusDates[step.status]) {
      step.date = statusDates[step.status];
    }
  });

  // Determine current step index
  const currentStepIndex = allStatuses.findIndex(step => step.status === currentStatus);
  
  // Handle special statuses
  const isSpecialStatus = currentStatus === "cancelled" || currentStatus === "issue";
  const specialStatus = isSpecialStatus ? specialStatuses[currentStatus] : null;
  if (specialStatus && statusDates[currentStatus]) {
    specialStatus.date = statusDates[currentStatus];
  }

  return (
    <Card className={`backdrop-blur-sm bg-white/40 border border-pink-200/50 ${className}`}>
      <CardHeader>
        <CardTitle>Job Status</CardTitle>
        <CardDescription>Current status and history</CardDescription>
      </CardHeader>
      <CardContent>
        {isSpecialStatus ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`w-16 h-16 rounded-full ${specialStatus?.color} flex items-center justify-center text-white mb-4`}>
              {specialStatus?.icon}
            </div>
            <h3 className="text-lg font-medium">{specialStatus?.label}</h3>
            {specialStatus?.date && (
              <p className="text-sm text-gray-500 mt-1">
                {format(specialStatus.date, "PPP 'at' p")}
              </p>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 right-0 top-6 h-1 bg-gray-200"></div>
            
            {/* Status steps */}
            <div className="flex justify-between relative">
              {allStatuses.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-2 ${
                        isCompleted ? step.color : "bg-gray-200"
                      } ${
                        isCurrent ? "ring-4 ring-pink-100" : ""
                      }`}
                    >
                      {step.icon}
                    </div>
                    <p className="text-sm font-medium">{step.label}</p>
                    {step.date && (
                      <p className="text-xs text-gray-500">
                        {format(step.date, "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Current status badge */}
        <div className="flex justify-center mt-6">
          <Badge className={`
            ${currentStatus === "scheduled" ? "bg-amber-100 text-amber-800 border-amber-200" : ""}
            ${currentStatus === "in-progress" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
            ${currentStatus === "completed" ? "bg-green-100 text-green-800 border-green-200" : ""}
            ${currentStatus === "cancelled" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
            ${currentStatus === "issue" ? "bg-red-100 text-red-800 border-red-200" : ""}
            px-3 py-1 text-sm
          `}>
            Current Status: {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace("-", " ")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}