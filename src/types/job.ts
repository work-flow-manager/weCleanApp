// Job-related types and interfaces

export type JobStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | "issue";
export type JobPriority = "low" | "medium" | "high" | "urgent";
export type AssignmentRole = "cleaner" | "lead" | "supervisor";

export interface Job {
  id: string;
  company_id: string;
  customer_id: string;
  service_type_id: string;
  title: string;
  description?: string;
  service_address: string;
  scheduled_date: string;
  scheduled_time: string;
  estimated_duration?: number;
  status: JobStatus;
  priority: JobPriority;
  special_instructions?: string;
  estimated_price?: number;
  final_price?: number;
  created_by: string;
  assigned_manager?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  customers?: Customer;
  service_types?: ServiceType;
  job_assignments?: JobAssignment[];
  job_updates?: JobUpdate[];
  job_reviews?: JobReview[];
  created_by_profile?: Profile;
  assigned_manager_profile?: Profile;
}

export interface JobAssignment {
  id: string;
  job_id: string;
  team_member_id: string;
  role: AssignmentRole;
  assigned_at: string;
  assigned_by: string;
  
  // Related data
  team_members?: TeamMember;
  assigned_by_profile?: Profile;
}

export interface JobUpdate {
  id: string;
  job_id: string;
  updated_by: string;
  status?: JobStatus;
  notes: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos?: string[];
  created_at: string;
  
  // Related data
  profiles?: Profile;
}

export interface JobReview {
  id: string;
  job_id: string;
  customer_id: string;
  rating: number;
  review_text?: string;
  photos?: string[];
  created_at: string;
}

export interface Customer {
  id: string;
  profile_id?: string;
  company_id: string;
  customer_type: "individual" | "business";
  business_name?: string;
  billing_address?: string;
  service_address?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  profiles?: Profile;
}

export interface ServiceType {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  base_price?: number;
  duration_minutes?: number;
  required_team_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  profile_id: string;
  company_id: string;
  employee_id?: string;
  hire_date?: string;
  hourly_rate?: number;
  skills?: string[];
  availability?: any;
  performance_rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Related data
  profiles?: Profile;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "team" | "customer";
  avatar_url?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface CreateJobRequest {
  title: string;
  description?: string;
  service_address: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_id: string;
  service_type_id: string;
  estimated_duration?: number;
  priority?: JobPriority;
  special_instructions?: string;
  estimated_price?: number;
  assigned_manager?: string;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  service_address?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_duration?: number;
  status?: JobStatus;
  priority?: JobPriority;
  special_instructions?: string;
  estimated_price?: number;
  final_price?: number;
  assigned_manager?: string;
}

export interface CreateJobAssignmentRequest {
  team_member_id: string;
  role?: AssignmentRole;
}

export interface CreateJobUpdateRequest {
  status?: JobStatus;
  notes: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos?: string[];
}

export interface JobFilters {
  status?: JobStatus;
  priority?: JobPriority;
  date?: string;
  customer_id?: string;
  team_member_id?: string;
  assigned_manager?: string;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
  limit: number;
  offset: number;
}

export interface JobResponse {
  job: Job;
}

export interface JobAssignmentsResponse {
  assignments: JobAssignment[];
}

export interface JobUpdatesResponse {
  updates: JobUpdate[];
}

// Utility types for job statistics
export interface JobStats {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  issue: number;
}

export interface TeamPerformanceStats {
  team_member_id: string;
  jobs_completed: number;
  average_rating: number;
  on_time_completion_rate: number;
  total_hours_worked: number;
}

export interface CustomerSatisfactionStats {
  customer_id: string;
  total_jobs: number;
  average_rating: number;
  repeat_customer: boolean;
  total_spent: number;
}

// Job validation helpers
export const JOB_STATUSES: JobStatus[] = ["scheduled", "in-progress", "completed", "cancelled", "issue"];
export const JOB_PRIORITIES: JobPriority[] = ["low", "medium", "high", "urgent"];
export const ASSIGNMENT_ROLES: AssignmentRole[] = ["cleaner", "lead", "supervisor"];

export const JOB_STATUS_COLORS = {
  scheduled: "bg-amber-500",
  "in-progress": "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
  issue: "bg-red-500",
} as const;

export const JOB_PRIORITY_COLORS = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
} as const;