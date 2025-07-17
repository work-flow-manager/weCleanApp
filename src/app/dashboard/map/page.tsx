"use client";

import React, { useState, useEffect } from "react";
import { JobsMap } from "@/components/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Sample data for demonstration
const sampleJobs = [
  {
    id: "job1",
    title: "Regular House Cleaning",
    address: "123 Main St, New York, NY",
    date: "2023-06-15",
    time: "09:00 AM",
    status: "scheduled" as const,
    customer: "John Smith",
    location: {
      longitude: -74.006,
      latitude: 40.7128,
    },
  },
  {
    id: "job2",
    title: "Office Deep Clean",
    address: "456 Park Ave, New York, NY",
    date: "2023-06-15",
    time: "02:00 PM",
    status: "in-progress" as const,
    customer: "ABC Corp",
    location: {
      longitude: -73.9664,
      latitude: 40.7829,
    },
  },
  {
    id: "job3",
    title: "Post-Construction Cleanup",
    address: "789 Broadway, New York, NY",
    date: "2023-06-16",
    time: "10:00 AM",
    status: "completed" as const,
    customer: "XYZ Builders",
    location: {
      longitude: -73.9874,
      latitude: 40.7484,
    },
  },
  {
    id: "job4",
    title: "Apartment Move-Out Clean",
    address: "101 5th Ave, New York, NY",
    date: "2023-06-17",
    time: "11:00 AM",
    status: "cancelled" as const,
    customer: "Sarah Johnson",
    location: {
      longitude: -73.9927,
      latitude: 40.7359,
    },
  },
  {
    id: "job5",
    title: "Restaurant Kitchen Cleaning",
    address: "202 W 34th St, New York, NY",
    date: "2023-06-18",
    time: "08:00 PM",
    status: "issue" as const,
    customer: "Tasty Bites Restaurant",
    location: {
      longitude: -73.9871,
      latitude: 40.7484,
    },
  },
];

const sampleTeamMembers = [
  {
    id: "team1",
    name: "Alice Cooper",
    avatar: "https://i.pravatar.cc/150?u=alice",
    location: {
      longitude: -73.9927,
      latitude: 40.7359,
      lastUpdated: "5 minutes ago",
    },
    isActive: true,
  },
  {
    id: "team2",
    name: "Bob Smith",
    avatar: "https://i.pravatar.cc/150?u=bob",
    location: {
      longitude: -73.9871,
      latitude: 40.7484,
      lastUpdated: "15 minutes ago",
    },
    isActive: true,
  },
  {
    id: "team3",
    name: "Carol Davis",
    avatar: "https://i.pravatar.cc/150?u=carol",
    location: {
      longitude: -74.006,
      latitude: 40.7128,
      lastUpdated: "2 hours ago",
    },
    isActive: false,
  },
];

export default function MapPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState(sampleJobs);
  const [teamMembers, setTeamMembers] = useState(sampleTeamMembers);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleJobClick = (jobId: string) => {
    console.log(`Clicked job: ${jobId}`);
    router.push(`/dashboard/jobs/${jobId}`);
  };

  const handleTeamMemberClick = (memberId: string) => {
    console.log(`Clicked team member: ${memberId}`);
    router.push(`/dashboard/team/${memberId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">Loading map...</h3>
          <p className="text-gray-500 mt-2">Please wait while we prepare the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Map View</h1>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="bg-pink-100/50">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
          >
            All Jobs
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled" 
            className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
          >
            Scheduled
          </TabsTrigger>
          <TabsTrigger 
            value="in-progress" 
            className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="border-pink-200/30">
            <CardHeader className="pb-2">
              <CardTitle>All Job Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <JobsMap
                jobs={jobs}
                teamMembers={teamMembers}
                onJobClick={handleJobClick}
                onTeamMemberClick={handleTeamMemberClick}
                showTeamLocations={true}
                height="600px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="border-pink-200/30">
            <CardHeader className="pb-2">
              <CardTitle>Scheduled Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <JobsMap
                jobs={jobs.filter(job => job.status === "scheduled")}
                teamMembers={teamMembers}
                onJobClick={handleJobClick}
                onTeamMemberClick={handleTeamMemberClick}
                showTeamLocations={false}
                height="600px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress">
          <Card className="border-pink-200/30">
            <CardHeader className="pb-2">
              <CardTitle>In Progress Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <JobsMap
                jobs={jobs.filter(job => job.status === "in-progress")}
                teamMembers={teamMembers}
                onJobClick={handleJobClick}
                onTeamMemberClick={handleTeamMemberClick}
                showTeamLocations={true}
                height="600px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="border-pink-200/30">
            <CardHeader className="pb-2">
              <CardTitle>Completed Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <JobsMap
                jobs={jobs.filter(job => job.status === "completed")}
                teamMembers={teamMembers}
                onJobClick={handleJobClick}
                onTeamMemberClick={handleTeamMemberClick}
                showTeamLocations={false}
                height="600px"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}