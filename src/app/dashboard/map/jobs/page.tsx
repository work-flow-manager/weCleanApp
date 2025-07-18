"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { JobClusterMap } from "@/components/map";
import { MapIcon, Calendar, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Sample data for demonstration
const sampleJobs = [
  {
    id: "job1",
    title: "Regular Cleaning - Johnson Residence",
    address: "123 Main St, San Francisco, CA",
    date: "July 20, 2025",
    time: "9:00 AM",
    status: "scheduled",
    customer: "Alice Johnson",
    location: {
      longitude: -122.4194,
      latitude: 37.7749
    }
  },
  {
    id: "job2",
    title: "Deep Cleaning - Smith Office",
    address: "456 Market St, San Francisco, CA",
    date: "July 20, 2025",
    time: "1:00 PM",
    status: "scheduled",
    customer: "Bob Smith",
    location: {
      longitude: -122.4284,
      latitude: 37.7914
    }
  },
  {
    id: "job3",
    title: "Post-Construction - New Building",
    address: "789 Howard St, San Francisco, CA",
    date: "July 20, 2025",
    time: "3:00 PM",
    status: "scheduled",
    customer: "Carol Davis",
    location: {
      longitude: -122.4071,
      latitude: 37.7835
    }
  },
  {
    id: "job4",
    title: "Regular Cleaning - Wilson Home",
    address: "321 Pine St, San Francisco, CA",
    date: "July 21, 2025",
    time: "10:00 AM",
    status: "scheduled",
    customer: "David Wilson",
    location: {
      longitude: -122.4015,
      latitude: 37.7923
    }
  },
  {
    id: "job5",
    title: "Move-out Cleaning - Apartment 4B",
    address: "555 Folsom St, San Francisco, CA",
    date: "July 21, 2025",
    time: "2:00 PM",
    status: "scheduled",
    customer: "Emma Brown",
    location: {
      longitude: -122.3954,
      latitude: 37.7857
    }
  },
  {
    id: "job6",
    title: "Regular Cleaning - Taylor Residence",
    address: "888 Bryant St, San Francisco, CA",
    date: "July 22, 2025",
    time: "9:00 AM",
    status: "scheduled",
    customer: "Frank Taylor",
    location: {
      longitude: -122.4048,
      latitude: 37.7751
    }
  },
  {
    id: "job7",
    title: "Deep Cleaning - Miller Home",
    address: "777 Harrison St, San Francisco, CA",
    date: "July 22, 2025",
    time: "1:00 PM",
    status: "scheduled",
    customer: "Grace Miller",
    location: {
      longitude: -122.3984,
      latitude: 37.7811
    }
  }
];

// Company office location
const officeLocation = {
  longitude: -122.4104,
  latitude: 37.7790,
  name: "Office"
};

export default function JobsMapPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState(sampleJobs);
  const [filteredJobs, setFilteredJobs] = useState(sampleJobs);
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOptimalRoute, setShowOptimalRoute] = useState(false);

  // Handle job click
  const handleJobClick = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}`);
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...jobs];
    
    // Apply date filter
    if (dateFilter !== "all") {
      filtered = filtered.filter(job => {
        if (dateFilter === "today") {
          return job.date === "July 20, 2025"; // Today in our sample data
        } else if (dateFilter === "tomorrow") {
          return job.date === "July 21, 2025"; // Tomorrow in our sample data
        } else if (dateFilter === "upcoming") {
          return job.date === "July 22, 2025"; // Upcoming in our sample data
        }
        return true;
      });
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    
    setFilteredJobs(filtered);
  }, [jobs, dateFilter, statusFilter]);

  return (
    <>
      <Helmet>
        <title>Job Map | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="Job Map"
          text="Visualize and optimize job locations"
          icon={<MapIcon className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Job Locations</CardTitle>
              <CardDescription>
                View all job locations and optimize routes for efficient scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Date</Label>
                    <Select
                      value={dateFilter}
                      onValueChange={setDateFilter}
                    >
                      <SelectTrigger id="date-filter" className="w-[180px]">
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger id="status-filter" className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="ml-auto">
                    <Button
                      variant="outline"
                      onClick={() => setShowOptimalRoute(!showOptimalRoute)}
                    >
                      {showOptimalRoute ? "Hide Optimal Route" : "Show Optimal Route"}
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="cluster">
                  <TabsList>
                    <TabsTrigger value="cluster">Clustered View</TabsTrigger>
                    <TabsTrigger value="route">Route Planning</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cluster" className="pt-4">
                    <div className="h-[600px] rounded-md overflow-hidden border">
                      <JobClusterMap
                        jobs={filteredJobs}
                        onJobClick={handleJobClick}
                        height="100%"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click on clusters to zoom in and see individual jobs. Click on job markers to view details.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="route" className="pt-4">
                    <div className="h-[600px] rounded-md overflow-hidden border">
                      <JobClusterMap
                        jobs={filteredJobs}
                        onJobClick={handleJobClick}
                        height="100%"
                        showOptimalRoute={showOptimalRoute}
                        startLocation={officeLocation}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Plan optimal routes for your team members. Routes start from your office location.
                    </p>
                  </TabsContent>
                </Tabs>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">About Job Clustering</h4>
                  <p className="text-xs text-blue-700">
                    Jobs are automatically clustered when they are close together. This helps you identify areas with multiple jobs for efficient scheduling. Click on a cluster to zoom in and see individual jobs. Use the route planning tab to optimize your team's travel routes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </>
  );
}