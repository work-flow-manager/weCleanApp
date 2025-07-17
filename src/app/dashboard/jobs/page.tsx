"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { JobsMap } from "@/components/map";
import { EnhancedJobsList } from "@/components/jobs";

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
    team: [
      { id: "team1", name: "Alice Cooper", avatar: "https://i.pravatar.cc/150?u=alice" },
      { id: "team2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob" },
    ],
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
    team: [
      { id: "team3", name: "Carol Davis", avatar: "https://i.pravatar.cc/150?u=carol" },
    ],
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
    team: [
      { id: "team1", name: "Alice Cooper", avatar: "https://i.pravatar.cc/150?u=alice" },
      { id: "team2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob" },
      { id: "team3", name: "Carol Davis", avatar: "https://i.pravatar.cc/150?u=carol" },
    ],
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
    team: [],
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
    team: [
      { id: "team2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob" },
    ],
  },
];

const sampleServiceTypes = [
  { id: "st1", name: "Regular Cleaning" },
  { id: "st2", name: "Deep Cleaning" },
  { id: "st3", name: "Post-Construction" },
  { id: "st4", name: "Move-Out Cleaning" },
];

const sampleTeamMembers = [
  { id: "team1", name: "Alice Cooper", avatar: "https://i.pravatar.cc/150?u=alice" },
  { id: "team2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=bob" },
  { id: "team3", name: "Carol Davis", avatar: "https://i.pravatar.cc/150?u=carol" },
];

export default function JobsPage() {
  const router = useRouter();
  const { profile, loading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"list" | "map">("list");

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateJob = () => {
    router.push("/dashboard/jobs/create");
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}`);
  };

  const handleUpdateStatus = async (jobId: string, status: any) => {
    console.log(`Updated job ${jobId} status to ${status}`);
    // In a real app, you would update the job status in the database
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900">Loading jobs...</h3>
        <p className="text-gray-500 mt-2">Please wait while we fetch your data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <div className="flex gap-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeView === "list"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("list")}
            >
              List View
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeView === "map"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("map")}
            >
              Map View
            </button>
          </div>
          <Button
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={handleCreateJob}
          >
            <Plus className="h-4 w-4 mr-2" /> New Job
          </Button>
        </div>
      </div>

      {activeView === "list" ? (
        <EnhancedJobsList
          jobs={sampleJobs}
          serviceTypes={sampleServiceTypes}
          teamMembers={sampleTeamMembers}
          userRole={profile?.role || "team"}
          onCreateJob={handleCreateJob}
          onViewJob={handleViewJob}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        <Card className="border-pink-200/30">
          <CardHeader className="pb-2">
            <CardTitle>Job Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <JobsMap
              jobs={sampleJobs}
              teamMembers={sampleTeamMembers.map(member => ({
                ...member,
                location: {
                  longitude: -73.98 + Math.random() * 0.1,
                  latitude: 40.73 + Math.random() * 0.1,
                  lastUpdated: "5 minutes ago",
                },
                isActive: Math.random() > 0.3,
              }))}
              onJobClick={handleViewJob}
              onTeamMemberClick={(id) => console.log(`Clicked team member: ${id}`)}
              showTeamLocations={true}
              height="600px"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}