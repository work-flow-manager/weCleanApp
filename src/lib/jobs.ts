import { 
  Job, 
  JobFilters, 
  JobListResponse, 
  JobResponse,
  CreateJobRequest,
  UpdateJobRequest,
  CreateJobAssignmentRequest,
  CreateJobUpdateRequest,
  JobAssignmentsResponse,
  JobUpdatesResponse,
  JobStats
} from "@/types/job";

// Base API URL
const API_BASE = "/api/jobs";

// Job API functions
export class JobsAPI {
  // Get all jobs with optional filtering
  static async getJobs(filters?: JobFilters & { limit?: number; offset?: number }): Promise<JobListResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get a specific job by ID
  static async getJob(id: string): Promise<JobResponse> {
    const response = await fetch(`${API_BASE}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Create a new job
  static async createJob(jobData: CreateJobRequest): Promise<JobResponse> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create job: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Update a job
  static async updateJob(id: string, updates: UpdateJobRequest): Promise<JobResponse> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update job: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Delete a job
  static async deleteJob(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete job: ${response.statusText}`);
    }
  }

  // Get job assignments
  static async getJobAssignments(jobId: string): Promise<JobAssignmentsResponse> {
    const response = await fetch(`${API_BASE}/${jobId}/assignments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job assignments: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Assign team member to job
  static async assignTeamMember(jobId: string, assignment: CreateJobAssignmentRequest): Promise<any> {
    const response = await fetch(`${API_BASE}/${jobId}/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignment),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to assign team member: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get job updates
  static async getJobUpdates(jobId: string): Promise<JobUpdatesResponse> {
    const response = await fetch(`${API_BASE}/${jobId}/updates`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job updates: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Create job update
  static async createJobUpdate(jobId: string, update: CreateJobUpdateRequest): Promise<any> {
    const response = await fetch(`${API_BASE}/${jobId}/updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create job update: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Utility functions for job management
export class JobUtils {
  // Calculate job statistics from a list of jobs
  static calculateJobStats(jobs: Job[]): JobStats {
    const stats: JobStats = {
      total: jobs.length,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      issue: 0,
    };

    jobs.forEach(job => {
      switch (job.status) {
        case "scheduled":
          stats.scheduled++;
          break;
        case "in-progress":
          stats.in_progress++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
        case "issue":
          stats.issue++;
          break;
      }
    });

    return stats;
  }

  // Get jobs for today
  static getTodaysJobs(jobs: Job[]): Job[] {
    const today = new Date().toISOString().split('T')[0];
    return jobs.filter(job => job.scheduled_date === today);
  }

  // Get upcoming jobs (next 7 days)
  static getUpcomingJobs(jobs: Job[]): Job[] {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduled_date);
      return jobDate >= today && jobDate <= nextWeek && job.status === "scheduled";
    });
  }

  // Get overdue jobs
  static getOverdueJobs(jobs: Job[]): Job[] {
    const today = new Date().toISOString().split('T')[0];
    return jobs.filter(job => 
      job.scheduled_date < today && 
      ["scheduled", "in-progress"].includes(job.status)
    );
  }

  // Format job duration
  static formatDuration(minutes?: number): string {
    if (!minutes) return "N/A";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  // Format job price
  static formatPrice(price?: number): string {
    if (!price) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Get job status color class
  static getStatusColor(status: Job["status"]): string {
    const colors = {
      scheduled: "bg-amber-500",
      "in-progress": "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-gray-500",
      issue: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  }

  // Get job priority color class
  static getPriorityColor(priority: Job["priority"]): string {
    const colors = {
      low: "bg-green-500",
      medium: "bg-amber-500",
      high: "bg-orange-500",
      urgent: "bg-red-500",
    };
    return colors[priority] || "bg-gray-500";
  }

  // Check if job can be edited
  static canEditJob(job: Job, userRole: string): boolean {
    // Completed and cancelled jobs cannot be edited
    if (["completed", "cancelled"].includes(job.status)) {
      return false;
    }
    
    // Only admin and manager can edit jobs
    return ["admin", "manager"].includes(userRole);
  }

  // Check if job can be deleted
  static canDeleteJob(job: Job, userRole: string): boolean {
    // Completed jobs cannot be deleted
    if (job.status === "completed") {
      return false;
    }
    
    // Only admin and manager can delete jobs
    return ["admin", "manager"].includes(userRole);
  }

  // Check if team member can be assigned to job
  static canAssignTeamMember(job: Job, userRole: string): boolean {
    // Cannot assign to completed or cancelled jobs
    if (["completed", "cancelled"].includes(job.status)) {
      return false;
    }
    
    // Only admin and manager can assign team members
    return ["admin", "manager"].includes(userRole);
  }

  // Get next available time slot (helper for scheduling)
  static getNextAvailableSlot(existingJobs: Job[], duration: number = 120): Date {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0); // 8 AM
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0); // 6 PM
    
    // Simple algorithm - find first available slot
    // In a real implementation, this would be more sophisticated
    let currentSlot = startOfDay;
    
    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot.getTime() + duration * 60 * 1000);
      
      // Check if this slot conflicts with existing jobs
      const hasConflict = existingJobs.some(job => {
        const jobStart = new Date(`${job.scheduled_date}T${job.scheduled_time}`);
        const jobEnd = new Date(jobStart.getTime() + (job.estimated_duration || 120) * 60 * 1000);
        
        return (currentSlot < jobEnd && slotEnd > jobStart);
      });
      
      if (!hasConflict) {
        return currentSlot;
      }
      
      // Move to next 30-minute slot
      currentSlot = new Date(currentSlot.getTime() + 30 * 60 * 1000);
    }
    
    // If no slot available today, try tomorrow
    const tomorrow = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    return tomorrow;
  }

  // Validate job data
  static validateJobData(jobData: Partial<CreateJobRequest>): string[] {
    const errors: string[] = [];
    
    if (!jobData.title?.trim()) {
      errors.push("Title is required");
    }
    
    if (!jobData.service_address?.trim()) {
      errors.push("Service address is required");
    }
    
    if (!jobData.scheduled_date) {
      errors.push("Scheduled date is required");
    }
    
    if (!jobData.scheduled_time) {
      errors.push("Scheduled time is required");
    }
    
    if (!jobData.customer_id) {
      errors.push("Customer is required");
    }
    
    if (!jobData.service_type_id) {
      errors.push("Service type is required");
    }
    
    // Validate date is not in the past
    if (jobData.scheduled_date) {
      const scheduledDate = new Date(jobData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (scheduledDate < today) {
        errors.push("Scheduled date cannot be in the past");
      }
    }
    
    return errors;
  }
}