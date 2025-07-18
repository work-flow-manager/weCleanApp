// Analytics-related types and interfaces

export interface AnalyticsTimeframe {
  start_date: string;
  end_date: string;
}

export interface AnalyticsFilters {
  timeframe: AnalyticsTimeframe;
  team_member_ids?: string[];
  service_type_ids?: string[];
  location_ids?: string[];
  customer_ids?: string[];
}

export interface AnalyticsMetric {
  name: string;
  value: number | string;
  change?: number; // Percentage change from previous period
  trend?: 'up' | 'down' | 'neutral';
}

export interface AnalyticsChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// Business Overview Analytics
export interface BusinessOverviewAnalytics {
  total_revenue: AnalyticsMetric;
  total_jobs: AnalyticsMetric;
  average_job_value: AnalyticsMetric;
  customer_satisfaction: AnalyticsMetric;
  revenue_chart: AnalyticsChartData;
  jobs_chart: AnalyticsChartData;
}

// Team Performance Analytics
export interface TeamPerformanceAnalytics {
  team_members: TeamMemberPerformance[];
  average_rating: AnalyticsMetric;
  jobs_completed: AnalyticsMetric;
  on_time_percentage: AnalyticsMetric;
  efficiency_chart: AnalyticsChartData;
}

export interface TeamMemberPerformance {
  id: string;
  name: string;
  avatar?: string;
  jobs_completed: number;
  on_time_percentage: number;
  average_rating: number;
  revenue_generated: number;
}

// Customer Analytics
export interface CustomerAnalytics {
  total_customers: AnalyticsMetric;
  new_customers: AnalyticsMetric;
  repeat_customers: AnalyticsMetric;
  average_customer_value: AnalyticsMetric;
  customer_growth_chart: AnalyticsChartData;
  customer_retention_chart: AnalyticsChartData;
}

// Job Analytics
export interface JobAnalytics {
  jobs_by_status: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  jobs_by_service_type: {
    service_type_id: string;
    service_type_name: string;
    count: number;
    percentage: number;
  }[];
  average_completion_time: AnalyticsMetric;
  jobs_chart: AnalyticsChartData;
}

// Financial Analytics
export interface FinancialAnalytics {
  revenue: AnalyticsMetric;
  expenses: AnalyticsMetric;
  profit: AnalyticsMetric;
  outstanding_invoices: AnalyticsMetric;
  revenue_by_service: {
    service_type_id: string;
    service_type_name: string;
    revenue: number;
    percentage: number;
  }[];
  revenue_chart: AnalyticsChartData;
}

// Location Analytics
export interface LocationAnalytics {
  jobs_by_location: {
    location_id: string;
    location_name: string;
    count: number;
    percentage: number;
  }[];
  heatmap_data: {
    lat: number;
    lng: number;
    weight: number;
  }[];
}

// Combined Analytics Data
export interface AnalyticsData {
  business_overview: BusinessOverviewAnalytics;
  team_performance: TeamPerformanceAnalytics;
  customer_analytics: CustomerAnalytics;
  job_analytics: JobAnalytics;
  financial_analytics: FinancialAnalytics;
  location_analytics: LocationAnalytics;
}

// Analytics Export Formats
export type ExportFormat = 'csv' | 'pdf' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  sections: string[];
  include_charts: boolean;
  timeframe: AnalyticsTimeframe;
}