// Report-related types and interfaces

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  created_at: string;
  updated_at?: string;
}

export interface ReportSection {
  id: string;
  type: 'business_overview' | 'team_performance' | 'customer_analytics' | 'job_analytics' | 'financial_analytics' | 'location_analytics';
  title: string;
  metrics: string[];
  charts: string[];
  sort_order: number;
}

export interface ReportFilter {
  id: string;
  type: 'timeframe' | 'team_member' | 'service_type' | 'location' | 'customer';
  value: string | string[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  day?: number; // Day of week (0-6) or day of month (1-31)
  time: string; // HH:MM format
  recipients: string[]; // Email addresses
  format: 'pdf' | 'csv' | 'excel';
}

export interface ReportGenerationOptions {
  templateId?: string;
  name: string;
  format: 'pdf' | 'csv' | 'excel';
  sections: ReportSection[];
  filters: ReportFilter[];
  includeCharts: boolean;
}

export interface ReportGenerationResult {
  id: string;
  name: string;
  format: 'pdf' | 'csv' | 'excel';
  url: string;
  size: number;
  generated_at: string;
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  format: 'pdf' | 'csv' | 'excel';
  url: string;
  size: number;
  generated_at: string;
  expires_at?: string;
}

// API Request/Response types
export interface CreateReportTemplateRequest {
  name: string;
  description?: string;
  sections: Omit<ReportSection, 'id'>[];
  filters: Omit<ReportFilter, 'id'>[];
  schedule?: ReportSchedule;
}

export interface UpdateReportTemplateRequest {
  name?: string;
  description?: string;
  sections?: Omit<ReportSection, 'id'>[];
  filters?: Omit<ReportFilter, 'id'>[];
  schedule?: ReportSchedule | null;
}

export interface GenerateReportRequest {
  template_id?: string;
  name: string;
  format: 'pdf' | 'csv' | 'excel';
  sections?: Omit<ReportSection, 'id'>[];
  filters?: Omit<ReportFilter, 'id'>[];
  include_charts: boolean;
}