"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Job {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "issue";
  customer: string;
}

interface JobsCalendarViewProps {
  jobs: Job[];
  onViewJob: (jobId: string) => void;
}

export default function JobsCalendarView({ jobs, onViewJob }: JobsCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "issue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getJobsForDay = (day: Date) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.date);
      return isSameDay(jobDate, day);
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-pink-200/30 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevMonth}
            className="border-pink-200/50 hover:bg-pink-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(new Date())}
            className="border-pink-200/50 hover:bg-pink-50"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextMonth}
            className="border-pink-200/50 hover:bg-pink-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div 
            key={day} 
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, i) => {
          const dayJobs = getJobsForDay(day);
          const isCurrentDay = isToday(day);
          
          return (
            <div 
              key={i} 
              className={`min-h-[100px] border ${
                isCurrentDay 
                  ? "border-pink-400 bg-pink-50/50" 
                  : "border-pink-100/50 hover:bg-pink-50/30"
              } rounded-md p-1`}
            >
              <div className="text-right mb-1">
                <span className={`text-sm ${isCurrentDay ? "font-bold text-pink-600" : "text-gray-600"}`}>
                  {format(day, "d")}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayJobs.length > 0 ? (
                  dayJobs.slice(0, 3).map(job => (
                    <TooltipProvider key={job.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`text-xs p-1 rounded cursor-pointer truncate ${getStatusColor(job.status)}`}
                            onClick={() => onViewJob(job.id)}
                          >
                            {job.time} - {job.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{job.title}</p>
                            <p>{job.time} - {job.customer}</p>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace("-", " ")}
                            </Badge>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ) : null}
                
                {dayJobs.length > 3 && (
                  <div className="text-xs text-center text-gray-500 bg-gray-100 rounded p-0.5">
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}