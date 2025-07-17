"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { JobForm } from "@/components/jobs/job-form";
import { JobsAPI } from "@/lib/jobs";
import { Job } from "@/types/job";
import { ProtectedRoute } from "@/components/protected-route";
import { Loader2 } from "lucide-react";

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const response = await JobsAPI.getJob(params.id);
        setJob(response.job);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const handleSuccess = (updatedJob: Job) => {
    router.push(`/jobs/${updatedJob.id}`);
  };

  const handleCancel = () => {
    router.push(`/jobs/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error || "Job not found"}</p>
        <button 
          className="text-pink-500 hover:text-pink-600"
          onClick={() => router.push("/jobs")}
        >
          Return to Jobs
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
          <p className="text-muted-foreground">
            Update the job details below.
          </p>
        </div>
        
        <JobForm job={job} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </ProtectedRoute>
  );
}