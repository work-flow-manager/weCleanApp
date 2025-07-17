"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, Calendar, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JobsList from "./JobsList";
import JobsCalendarView from "./JobsCalendarView";
import JobsFilterPanel from "./JobsFilterPanel";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
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
  team: TeamMember[];
  serviceTypeId?: string;
}

interface ServiceType {
  id: string;
  name: string;
}

interface FilterOptions {
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  teamMembers: string[];
  serviceTypes: string[];
}

interface EnhancedJobsListProps {
  jobs?: DisplayJob[];
  serviceTypes?: ServiceType[];
  teamMembers?: TeamMember[];
  userRole?: "admin" | "manager" | "team" | "customer";
  onCreateJob?: () => void;
  onViewJob?: (jobId: string) => void;
  onUpdateStatus?: (jobId: string, status: DisplayJob["status"]) => void;
}

export default function EnhancedJobsList({
  jobs: propJobs,
  serviceTypes: propServiceTypes = [],
  teamMembers: propTeamMembers = [],
  userRole = "manager",
  onCreateJob = () => {},
  onViewJob = () => {},
  onUpdateStatus = () => {},
}: EnhancedJobsListProps) {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<DisplayJob[]>(propJobs || []);
  const [filteredJobs, setFilteredJobs] = useState<DisplayJob[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    dateRange: { start: "", end: "" },
    teamMembers: [],
    serviceTypes: [],
  });

  // Apply filters and search to jobs
  useEffect(() => {
    if (!jobs) return;

    let filtered = [...jobs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.address.toLowerCase().includes(query) ||
          job.customer.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((job) => filters.status.includes(job.status));
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.date);
        const startDate = filters.dateRange.start
          ? new Date(filters.dateRange.start)
          : null;
        const endDate = filters.dateRange.end
          ? new Date(filters.dateRange.end)
          : null;

        if (startDate && endDate) {
          return jobDate >= startDate && jobDate <= endDate;
        } else if (startDate) {
          return jobDate >= startDate;
        } else if (endDate) {
          return jobDate <= endDate;
        }
        return true;
      });
    }

    // Apply team members filter
    if (filters.teamMembers.length > 0) {
      filtered = filtered.filter((job) =>
        job.team.some((member) => filters.teamMembers.includes(member.id))
      );
    }

    // Apply service types filter
    if (filters.serviceTypes.length > 0) {
      filtered = filtered.filter(
        (job) =>
          job.serviceTypeId && filters.serviceTypes.includes(job.serviceTypeId)
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, filters]);

  // Update jobs when prop changes
  useEffect(() => {
    if (propJobs) {
      setJobs(propJobs);
    }
  }, [propJobs]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const canCreateJobs = userRole === "admin" || userRole === "manager";

  return (
    <div className="space-y-4">
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
            <JobsFilterPanel
              onFilterChange={handleFilterChange}
              teamMembers={propTeamMembers}
              serviceTypes={propServiceTypes}
              activeFilters={filters}
            />

            <Tabs defaultValue="grid" className="hidden sm:flex">
              <TabsList className="bg-pink-100/50">
                <TabsTrigger
                  value="grid"
                  onClick={() => setViewMode("grid")}
                  className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
                >
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  onClick={() => setViewMode("list")}
                  className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
                >
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  onClick={() => setViewMode("calendar")}
                  className="data-[state=active]:bg-white data-[state=active]:text-pink-500"
                >
                  <Calendar className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {canCreateJobs && (
              <Button
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={onCreateJob}
              >
                <Plus className="h-4 w-4 mr-2" /> New Job
              </Button>
            )}
          </div>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <JobsCalendarView jobs={filteredJobs} onViewJob={onViewJob} />
      ) : (
        <JobsList
          jobs={filteredJobs}
          userRole={userRole}
          onCreateJob={onCreateJob}
          onViewJob={onViewJob}
          onUpdateStatus={onUpdateStatus}
          viewMode={viewMode}
        />
      )}
    </div>
  );
}