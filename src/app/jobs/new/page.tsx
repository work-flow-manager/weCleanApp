"use client";

import { useRouter } from "next/navigation";
import { Metadata } from "next";
import { JobForm } from "@/components/jobs/job-form";
import { Job } from "@/types/job";
import { ProtectedRoute } from "@/components/protected-route";

export default function NewJobPage() {
  const router = useRouter();

  const handleSuccess = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleCancel = () => {
    router.push("/jobs");
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "manager", "customer"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Job</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new cleaning job.
          </p>
        </div>
        
        <JobForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </ProtectedRoute>
  );
}