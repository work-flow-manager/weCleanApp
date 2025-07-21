"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import JobsList from "@/components/jobs/JobsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { JobsAPI } from "@/lib/jobs";
import { Job, JobStatus } from "@/types/job";
import { ProtectedRoute } from "@/components/protected-route";

// Define the DisplayJob interface to match what JobsList expects
interface JobMember {
  id: string;
  name: string;
  avatar?: string;
}

interface DisplayJob {
  id: string;
  title: string;
  address: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "issue";
  customer: string;
  team: JobMember[];
}

export default function JobsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [displayJobs, setDisplayJobs] = useState<DisplayJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await JobsAPI.getJobs();
        const fetchedJobs = response.jobs || [];
        setJobs(fetchedJobs);
        
        // Transform jobs to display format
        const transformedJobs: DisplayJob[] = fetchedJobs.map(job => ({
          id: job.id,
          title: job.title,
          address: job.service_address,
          date: new Date(job.scheduled_date).toLocaleDateString(),
          time: job.scheduled_time,
          status: job.status,
          customer: job.customers?.business_name || "Unknown Customer",
          team: job.job_assignments?.map(assignment => ({
            id: assignment.team_member_id,
            name: assignment.team_members?.profiles?.full_name || "Unknown",
            avatar: assignment.team_members?.profiles?.avatar_url,
          })) || [],
        }));
        
        setDisplayJobs(transformedJobs);
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

  const handleUpdateStatus = async (jobId: string, status: JobStatus) => {
    try {
      await JobsAPI.updateJob(jobId, { status });
      
      // Refresh jobs
      const response = await JobsAPI.getJobs();
      const fetchedJobs = response.jobs || [];
      setJobs(fetchedJobs);
      
      // Transform jobs to display format
      const transformedJobs: DisplayJob[] = fetchedJobs.map(job => ({
        id: job.id,
        title: job.title,
        address: job.service_address,
        date: new Date(job.scheduled_date).toLocaleDateString(),
        time: job.scheduled_time,
        status: job.status,
        customer: job.customers?.business_name || "Unknown Customer",
        team: job.job_assignments?.map(assignment => ({
          id: assignment.team_member_id,
          name: assignment.team_members?.profiles?.full_name || "Unknown",
          avatar: assignment.team_members?.profiles?.avatar_url,
        })) || [],
      }));
      
      setDisplayJobs(transformedJobs);
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
          jobs={displayJobs}
          userRole={profile?.role}
          onCreateJob={handleCreateJob}
          onViewJob={handleViewJob}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </ProtectedRoute>
  );
}