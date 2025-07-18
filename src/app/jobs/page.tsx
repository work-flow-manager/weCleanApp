"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import JobsList from "@/components/jobs/JobsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { JobsAPI } from "@/lib/jobs";
import { ProtectedRoute } from "@/components/protected-route";

export default function JobsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await JobsAPI.getJobs();
        setJobs(response.jobs || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleCreateJob = () => {
    router.push("/jobs/new");
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleUpdateStatus = async (jobId: string, status: string) => {
    try {
      await JobsAPI.updateJob(jobId, { status });
      
      // Refresh jobs
      const response = await JobsAPI.getJobs();
      setJobs(response.jobs || []);
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const canCreateJobs = ["admin", "manager", "customer"].includes(profile?.role || "");

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground">
              Manage and track all cleaning jobs
            </p>
          </div>
          {canCreateJobs && (
            <Button 
              onClick={handleCreateJob}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> New Job
            </Button>
          )}
        </div>
        
        <JobsList 
          jobs={jobs}
          userRole={profile?.role}
          onCreateJob={handleCreateJob}
          onViewJob={handleViewJob}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </ProtectedRoute>
  );
}