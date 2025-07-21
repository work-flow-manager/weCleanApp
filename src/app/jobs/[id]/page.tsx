"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { JobsAPI, JobUtils } from "@/lib/jobs";
import { Job, JobStatus } from "@/types/job";
import { JobUpdateForm } from "@/components/jobs/job-update-form";
import { TeamAssignmentForm } from "@/components/jobs/team-assignment-form";
import { JobHistoryTimeline } from "@/components/jobs/job-history-timeline";
import { JobStatusTimeline } from "@/components/jobs/job-status-timeline";
import { PhotoUpload } from "@/components/jobs/photo-upload";
import { PhotoGallery } from "@/components/jobs/photo-gallery";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Loader2,
  MapPin,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import { format } from "date-fns";

interface JobPageProps {
  params: {
    id: string;
  };
}

export default function JobPage({ params }: JobPageProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

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

  const handleStatusUpdate = async (status: JobStatus) => {
    if (!job) return;

    try {
      setIsLoading(true);
      await JobsAPI.updateJob(job.id, { status });

      // Refresh job data
      const response = await JobsAPI.getJob(params.id);
      setJob(response.job);
    } catch (err) {
      console.error("Error updating job status:", err);
      setError("Failed to update job status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit =
    job && profile?.role && JobUtils.canEditJob(job, profile.role);

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

  const statusColors = {
    scheduled: "bg-amber-100 text-amber-800 border-amber-200",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    issue: "bg-red-100 text-red-800 border-red-200",
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    urgent: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground">
              Job #{job.id.substring(0, 8)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                onClick={() => router.push(`/jobs/${job.id}/edit`)}
                variant="outline"
                className="border-pink-200"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Job
              </Button>
            )}
            <Button onClick={() => router.push("/jobs")} variant="ghost">
              Back to Jobs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Status Timeline */}
            {job.job_updates && (
              <JobStatusTimeline
                currentStatus={job.status}
                statusHistory={job.job_updates
                  .filter((update) => update.status)
                  .map((update) => ({
                    status: update.status as JobStatus,
                    date: update.created_at,
                  }))}
              />
            )}

            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>Job Details</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={statusColors[job.status]}>
                      {job.status.charAt(0).toUpperCase() +
                        job.status.slice(1).replace("-", " ")}
                    </Badge>
                    <Badge className={priorityColors[job.priority]}>
                      {job.priority.charAt(0).toUpperCase() +
                        job.priority.slice(1)}{" "}
                      Priority
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Created on {new Date(job.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Service Address
                    </h3>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-pink-500 mt-1" />
                      <p>{job.service_address}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Schedule
                    </h3>
                    <div className="flex items-start gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-pink-500 mt-1" />
                      <div>
                        <p>
                          {new Date(job.scheduled_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {job.scheduled_time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Duration
                    </h3>
                    <div className="flex items-start gap-2 mt-1">
                      <Clock className="h-4 w-4 text-pink-500 mt-1" />
                      <p>
                        {job.estimated_duration
                          ? JobUtils.formatDuration(job.estimated_duration)
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Price</h3>
                    <div className="flex items-start gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-pink-500 mt-1" />
                      <p>
                        {job.estimated_price
                          ? JobUtils.formatPrice(job.estimated_price)
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Service Type
                  </h3>
                  <p className="mt-1">
                    {job.service_types?.name || "Standard Cleaning"}
                  </p>
                </div>

                {job.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Description
                    </h3>
                    <p className="mt-1">{job.description}</p>
                  </div>
                )}

                {job.special_instructions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Special Instructions
                    </h3>
                    <div className="mt-1 p-3 bg-amber-50 border border-amber-100 rounded-md">
                      <p>{job.special_instructions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="updates" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="updates" className="space-y-4">
                {/* Job History Timeline */}
                {job.job_updates && job.job_updates.length > 0 && (
                  <JobHistoryTimeline updates={job.job_updates} />
                )}

                {/* Add Update Form - Only show for admin, manager, team */}
                {["admin", "manager", "team"].includes(profile?.role || "") &&
                  job.status !== "completed" &&
                  job.status !== "cancelled" && (
                    <JobUpdateForm
                      jobId={job.id}
                      currentStatus={job.status}
                      onSuccess={() => {
                        // Refresh job data
                        setIsLoading(true);
                        JobsAPI.getJob(params.id)
                          .then((response) => {
                            setJob(response.job);
                            setIsLoading(false);
                          })
                          .catch((err) => {
                            console.error("Error refreshing job:", err);
                            setIsLoading(false);
                          });
                      }}
                    />
                  )}
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                  <CardHeader>
                    <CardTitle>Assigned Team</CardTitle>
                    <CardDescription>
                      Team members working on this job
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {job.job_assignments && job.job_assignments.length > 0 ? (
                      <div className="space-y-4">
                        {job.job_assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between border-b border-pink-100 pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-pink-100 text-pink-500">
                                  {assignment.team_members?.profiles?.full_name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "TM"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {assignment.team_members?.profiles
                                    ?.full_name || "Team Member"}
                                </p>
                                <p className="text-sm text-gray-500 capitalize">
                                  {assignment.role || "Cleaner"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {assignment.role || "Cleaner"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="h-12 w-12 text-pink-200 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No team members assigned yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Assignment Form - Only show for admin and manager */}
                {["admin", "manager"].includes(profile?.role || "") &&
                  job.status !== "completed" &&
                  job.status !== "cancelled" && (
                    <TeamAssignmentForm
                      jobId={job.id}
                      onSuccess={() => {
                        // Refresh job data
                        setIsLoading(true);
                        JobsAPI.getJob(params.id)
                          .then((response) => {
                            setJob(response.job);
                            setIsLoading(false);
                          })
                          .catch((err) => {
                            console.error("Error refreshing job:", err);
                            setIsLoading(false);
                          });
                      }}
                    />
                  )}
              </TabsContent>

              <TabsContent value="photos" className="space-y-4">
                {(job as any).photos && (job as any).photos.length > 0 ? (
                  <PhotoGallery photos={(job as any).photos} />
                ) : (
                  <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                    <CardContent className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-pink-200 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">
                        No photos uploaded yet
                      </p>
                      <p className="text-gray-500 mt-1">
                        Upload photos to document the job progress
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Photo Upload - Only show for admin, manager, team */}
                {["admin", "manager", "team"].includes(profile?.role || "") &&
                  job.status !== "cancelled" && (
                    <PhotoUpload
                      jobId={job.id}
                      onSuccess={() => {
                        // Refresh job data
                        setIsLoading(true);
                        JobsAPI.getJob(params.id)
                          .then((response) => {
                            setJob(response.job);
                            setIsLoading(false);
                          })
                          .catch((err) => {
                            console.error("Error refreshing job:", err);
                            setIsLoading(false);
                          });
                      }}
                    />
                  )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-pink-100 text-pink-500">
                      {job.customers?.profiles?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {job.customers?.business_name ||
                        job.customers?.profiles?.full_name ||
                        "Customer"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {job.customers?.customer_type === "business"
                        ? "Business"
                        : "Individual"}
                    </p>
                  </div>
                </div>

                {job.customers?.profiles?.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{job.customers.profiles.phone}</p>
                  </div>
                )}

                {job.customers?.profiles?.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{job.customers.profiles.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["admin", "manager", "team"].includes(profile?.role || "") && (
                  <>
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => handleStatusUpdate("in-progress")}
                      disabled={
                        job.status === "in-progress" ||
                        job.status === "completed" ||
                        job.status === "cancelled"
                      }
                    >
                      Start Job
                    </Button>

                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleStatusUpdate("completed")}
                      disabled={
                        job.status === "completed" || job.status === "cancelled"
                      }
                    >
                      Complete Job
                    </Button>

                    {["admin", "manager"].includes(profile?.role || "") && (
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => handleStatusUpdate("cancelled")}
                        disabled={
                          job.status === "completed" ||
                          job.status === "cancelled"
                        }
                      >
                        Cancel Job
                      </Button>
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full border-pink-200"
                  onClick={() => router.push("/jobs")}
                >
                  Back to Jobs
                </Button>
              </CardContent>
            </Card>

            {job.assigned_manager_profile && (
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader>
                  <CardTitle>Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-pink-100 text-pink-500">
                        {job.assigned_manager_profile.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {job.assigned_manager_profile.full_name}
                      </p>
                      <p className="text-sm text-gray-500">Manager</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
