"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import EnhancedJobsList from "@/components/jobs/EnhancedJobsList";
import { useRouter } from "next/navigation";
import { getJobs, getServiceTypes, getTeamMembers } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function JobsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [jobsData, serviceTypesData, teamMembersData] = await Promise.all([
          getJobs(),
          getServiceTypes(),
          getTeamMembers()
        ]);

        // Transform jobs data
        const transformedJobs = jobsData.map((job) => ({
          id: job.id,
          title: job.title,
          address: job.service_address,
          date: new Date(job.scheduled_date).toLocaleDateString(),
          time: job.scheduled_time,
          status: job.status,
          customer: job.customers?.business_name || "Unknown Customer",
          serviceTypeId: job.service_type_id,
          team: job.job_assignments?.map((assignment) => ({
            id: assignment.team_members?.id || "",
            name: assignment.team_members?.profiles?.full_name || "Unknown",
            avatar: assignment.team_members?.profiles?.avatar_url,
          })) || [],
        }));

        setJobs(transformedJobs);
        setServiceTypes(serviceTypesData || []);
        setTeamMembers(teamMembersData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateJob = () => {
    router.push("/dashboard/jobs/create");
  };

  const handleViewJob = (jobId) => {
    router.push(`/dashboard/jobs/${jobId}`);
  };

  const handleUpdateStatus = async (jobId, status) => {
    try {
      // Update job status logic here
      // After successful update, refresh the jobs list
      const updatedJobs = await getJobs();
      
      // Transform jobs data
      const transformedJobs = updatedJobs.map((job) => ({
        id: job.id,
        title: job.title,
        address: job.service_address,
        date: new Date(job.scheduled_date).toLocaleDateString(),
        time: job.scheduled_time,
        status: job.status,
        customer: job.customers?.business_name || "Unknown Customer",
        serviceTypeId: job.service_type_id,
        team: job.job_assignments?.map((assignment) => ({
          id: assignment.team_members?.id || "",
          name: assignment.team_members?.profiles?.full_name || "Unknown",
          avatar: assignment.team_members?.profiles?.avatar_url,
        })) || [],
      }));

      setJobs(transformedJobs);
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900">Loading jobs...</h3>
        <p className="text-gray-500 mt-2">Please wait while we fetch your data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedJobsList
        jobs={jobs}
        serviceTypes={serviceTypes}
        teamMembers={teamMembers}
        userRole={profile?.role || "team"}
        onCreateJob={handleCreateJob}
        onViewJob={handleViewJob}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}