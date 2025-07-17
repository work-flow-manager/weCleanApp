"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  MapPin,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createJob,
  getJobs,
  updateJobStatus,
  getServiceTypes,
  Job,
  ServiceType,
} from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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

interface JobsListProps {
  jobs?: DisplayJob[];
  userRole?: "admin" | "manager" | "team" | "customer";
  onCreateJob?: () => void;
  onViewJob?: (jobId: string) => void;
  onUpdateStatus?: (jobId: string, status: DisplayJob["status"]) => void;
}

interface JobFormData {
  title: string;
  service_address: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_name: string;
  service_type_id: string;
  description: string;
  special_instructions: string;
}

export default function JobsList({
  jobs: propJobs,
  userRole = "manager",
  onCreateJob = () => {},
  onViewJob = () => {},
  onUpdateStatus = () => {},
}: JobsListProps) {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DisplayJob["status"] | "all"
  >("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [jobs, setJobs] = useState<DisplayJob[]>(propJobs || []);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    service_address: "",
    scheduled_date: "",
    scheduled_time: "",
    customer_name: "",
    service_type_id: "",
    description: "",
    special_instructions: "",
  });

  // Load jobs and service types on component mount
  useEffect(() => {
    if (!propJobs) {
      loadJobs();
    }
    loadServiceTypes();
  }, [propJobs]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const jobsData = await getJobs();

      // Transform the data to match the DisplayJob interface
      const transformedJobs: DisplayJob[] = jobsData.map((job: any) => ({
        id: job.id,
        title: job.title,
        address: job.service_address,
        date: new Date(job.scheduled_date).toLocaleDateString(),
        time: job.scheduled_time,
        status: job.status,
        customer: job.customers?.business_name || "Unknown Customer",
        team:
          job.job_assignments?.map((assignment: any) => ({
            id: assignment.team_members?.id || "",
            name: assignment.team_members?.profiles?.full_name || "Unknown",
            avatar: assignment.team_members?.profiles?.avatar_url,
          })) || [],
      }));

      setJobs(transformedJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceTypes = async () => {
    try {
      const types = await getServiceTypes();
      setServiceTypes(types || []);
    } catch (error) {
      console.error("Error loading service types:", error);
    }
  };

  const handleCreateJob = async () => {
    if (
      !formData.title ||
      !formData.service_address ||
      !formData.scheduled_date ||
      !formData.scheduled_time ||
      !formData.customer_name
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await createJob(formData);

      // Reset form
      setFormData({
        title: "",
        service_address: "",
        scheduled_date: "",
        scheduled_time: "",
        customer_name: "",
        service_type_id: "",
        description: "",
        special_instructions: "",
      });

      setIsCreateDialogOpen(false);

      // Reload jobs
      await loadJobs();

      // Call the prop callback
      onCreateJob();
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    jobId: string,
    status: DisplayJob["status"],
  ) => {
    try {
      await updateJobStatus(jobId, status);
      await loadJobs();
      onUpdateStatus(jobId, status);
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status. Please try again.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const canCreateJobs = userRole === "admin" || userRole === "manager";
  const canUpdateStatus =
    userRole === "admin" || userRole === "manager" || userRole === "team";

  const getStatusColor = (status: DisplayJob["status"]) => {
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

  const getStatusIcon = (status: DisplayJob["status"]) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      case "issue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl border border-pink-200/30 p-6 shadow-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Jobs</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search jobs..."
                className="pl-9 bg-white/70 border-pink-200/50 focus:border-pink-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-pink-200/50 hover:bg-pink-50"
                  >
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Jobs
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("scheduled")}
                  >
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("in-progress")}
                  >
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("completed")}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("issue")}>
                    Issues
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("cancelled")}
                  >
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tabs defaultValue="grid" className="hidden sm:flex">
                <TabsList className="bg-pink-100/50">
                  <TabsTrigger
                    value="grid"
                    onClick={() => setViewMode("grid")}
                    className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
                  >
                    Grid
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    onClick={() => setViewMode("list")}
                    className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
                  >
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {canCreateJobs && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                      <Plus className="h-4 w-4 mr-2" /> New Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-lg border border-pink-200/50">
                    <DialogHeader>
                      <DialogTitle className="text-pink-500">
                        Create New Job
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid gap-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                          Job Title *
                        </Label>
                        <Input
                          id="title"
                          placeholder="Enter job title"
                          className="border-pink-200/50"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="service_type"
                          className="text-sm font-medium"
                        >
                          Service Type
                        </Label>
                        <Select
                          value={formData.service_type_id}
                          onValueChange={(value) =>
                            setFormData({ ...formData, service_type_id: value })
                          }
                        >
                          <SelectTrigger className="border-pink-200/50">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}{" "}
                                {type.base_price && `- ${type.base_price}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="address"
                          className="text-sm font-medium"
                        >
                          Service Address *
                        </Label>
                        <Input
                          id="address"
                          placeholder="Enter service address"
                          className="border-pink-200/50"
                          value={formData.service_address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              service_address: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date" className="text-sm font-medium">
                            Date *
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            className="border-pink-200/50"
                            value={formData.scheduled_date}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduled_date: e.target.value,
                              })
                            }
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="time" className="text-sm font-medium">
                            Time *
                          </Label>
                          <Input
                            id="time"
                            type="time"
                            className="border-pink-200/50"
                            value={formData.scheduled_time}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduled_time: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="customer"
                          className="text-sm font-medium"
                        >
                          Customer Name *
                        </Label>
                        <Input
                          id="customer"
                          placeholder="Enter customer name"
                          className="border-pink-200/50"
                          value={formData.customer_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customer_name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Enter job description"
                          className="border-pink-200/50 min-h-[80px]"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="instructions"
                          className="text-sm font-medium"
                        >
                          Special Instructions
                        </Label>
                        <Textarea
                          id="instructions"
                          placeholder="Any special instructions or notes"
                          className="border-pink-200/50 min-h-[60px]"
                          value={formData.special_instructions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              special_instructions: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="border-pink-200/50"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                        onClick={handleCreateJob}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Job"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {statusFilter !== "all" && (
          <div className="flex items-center">
            <Badge
              className={`${getStatusColor(statusFilter as DisplayJob["status"])} flex items-center gap-1`}
            >
              {getStatusIcon(statusFilter as DisplayJob["status"])}
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="text-xs text-gray-500 hover:text-gray-700 ml-2"
            >
              Clear filter
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Loading jobs...
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Please wait while we fetch your jobs.
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-pink-100 p-3 mb-4">
              <Calendar className="h-6 w-6 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {searchQuery
                ? `No jobs match your search "${searchQuery}".`
                : statusFilter !== "all"
                  ? `No ${statusFilter} jobs found.`
                  : "There are no jobs to display."}
            </p>
            {canCreateJobs && (
              <Button
                className="mt-4 bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Create New Job
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white/70 backdrop-blur-sm border-pink-100/50"
                onClick={() => onViewJob(job.id)}
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 truncate">
                        {job.title}
                      </h3>
                      <Badge
                        className={`${getStatusColor(job.status)} flex items-center gap-1 ml-2 whitespace-nowrap`}
                      >
                        {getStatusIcon(job.status)}
                        {job.status
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-start gap-1 text-gray-500">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm truncate">{job.address}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{job.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{job.time}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-gray-500">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{job.customer}</span>
                    </div>
                  </div>

                  <div className="border-t border-pink-100/50 p-4 bg-pink-50/50">
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {job.team.map((member) => (
                          <Avatar
                            key={member.id}
                            className="border-2 border-white h-8 w-8"
                          >
                            {member.avatar ? (
                              <AvatarImage
                                src={member.avatar}
                                alt={member.name}
                              />
                            ) : (
                              <AvatarFallback className="bg-pink-200 text-pink-800">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        ))}
                      </div>

                      {canUpdateStatus && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "scheduled");
                              }}
                            >
                              Mark as Scheduled
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "in-progress");
                              }}
                            >
                              Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "completed");
                              }}
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "issue");
                              }}
                            >
                              Report Issue
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "cancelled");
                              }}
                            >
                              Cancel Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-pink-100/50 bg-white/70 backdrop-blur-sm">
            <table className="min-w-full divide-y divide-pink-100">
              <thead className="bg-pink-50/70">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Job Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Team
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pink-100/50">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-pink-50/50 cursor-pointer"
                    onClick={() => onViewJob(job.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {job.title}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-xs">
                            {job.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{job.date}</div>
                      <div className="text-sm text-gray-500">{job.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {job.customer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {job.team.map((member) => (
                          <Avatar
                            key={member.id}
                            className="border-2 border-white h-7 w-7"
                          >
                            {member.avatar ? (
                              <AvatarImage
                                src={member.avatar}
                                alt={member.name}
                              />
                            ) : (
                              <AvatarFallback className="bg-pink-200 text-pink-800 text-xs">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`${getStatusColor(job.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(job.status)}
                        {job.status
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canUpdateStatus && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "scheduled");
                              }}
                            >
                              Mark as Scheduled
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "in-progress");
                              }}
                            >
                              Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "completed");
                              }}
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "issue");
                              }}
                            >
                              Report Issue
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(job.id, "cancelled");
                              }}
                            >
                              Cancel Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Sample data for default display
const defaultJobs: DisplayJob[] = [
  {
    id: "1",
    title: "Regular House Cleaning",
    address: "123 Main St, Apartment 4B, New York, NY 10001",
    date: "2023-06-15",
    time: "09:00 AM",
    status: "scheduled",
    customer: "John Smith",
    team: [
      { id: "t1", name: "Maria Rodriguez" },
      { id: "t2", name: "David Chen" },
    ],
  },
  {
    id: "2",
    title: "Deep Office Cleaning",
    address: "456 Business Ave, Suite 200, Chicago, IL 60601",
    date: "2023-06-15",
    time: "02:00 PM",
    status: "in-progress",
    customer: "Acme Corp",
    team: [
      { id: "t3", name: "James Wilson" },
      { id: "t4", name: "Sarah Johnson" },
      { id: "t5", name: "Michael Brown" },
    ],
  },
  {
    id: "3",
    title: "Post-Construction Cleanup",
    address: "789 Development Rd, Miami, FL 33101",
    date: "2023-06-14",
    time: "10:30 AM",
    status: "completed",
    customer: "Builders Inc",
    team: [
      { id: "t1", name: "Maria Rodriguez" },
      { id: "t6", name: "Robert Taylor" },
      { id: "t7", name: "Lisa Garcia" },
      { id: "t8", name: "Thomas Martinez" },
    ],
  },
  {
    id: "4",
    title: "Apartment Move-Out Cleaning",
    address: "101 Resident Lane, Apt 303, Boston, MA 02108",
    date: "2023-06-16",
    time: "01:00 PM",
    status: "scheduled",
    customer: "Emma Wilson",
    team: [
      { id: "t2", name: "David Chen" },
      { id: "t9", name: "Amanda Lewis" },
    ],
  },
  {
    id: "5",
    title: "Weekly Maintenance Cleaning",
    address: "222 Corporate Plaza, San Francisco, CA 94105",
    date: "2023-06-16",
    time: "07:00 AM",
    status: "issue",
    customer: "Tech Innovations LLC",
    team: [
      { id: "t3", name: "James Wilson" },
      { id: "t10", name: "Patricia Moore" },
    ],
  },
  {
    id: "6",
    title: "Restaurant Kitchen Deep Clean",
    address: "555 Culinary Blvd, Austin, TX 78701",
    date: "2023-06-14",
    time: "11:00 PM",
    status: "cancelled",
    customer: "Gourmet Eats Restaurant",
    team: [
      { id: "t11", name: "Daniel Jackson" },
      { id: "t12", name: "Sophia Kim" },
      { id: "t13", name: "Kevin Patel" },
    ],
  },
];
