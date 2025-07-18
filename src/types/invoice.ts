// Invoice-related types and interfaces

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  company_id: string;
  customer_id: string;
  job_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  status: InvoiceStatus;
  notes?: string;
  payment_terms?: string;
  paid_amount?: number;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  customers?: Customer;
  jobs?: Job;
  invoice_items?: InvoiceItem[];
  invoice_payments?: InvoicePayment[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate?: number;
  tax_amount?: number;
  service_type_id?: string;
  
  // Related data
  service_types?: ServiceType;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  
  // Related data
  profiles?: Profile;
}

// API Request/Response types
export interface CreateInvoiceRequest {
  customer_id: string;
  job_id?: string;
  issue_date?: string;
  due_date?: string;
  tax_rate?: number;
  notes?: string;
  payment_terms?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    service_type_id?: string;
    tax_rate?: number;
  }[];
}

export interface UpdateInvoiceRequest {
  issue_date?: string;
  due_date?: string;
  tax_rate?: number;
  notes?: string;
  payment_terms?: string;
  status?: InvoiceStatus;
}

export interface CreateInvoicePaymentRequest {
  amount: number;
  payment_date?: string;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  customer_id?: string;
  job_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  limit: number;
  offset: number;
}

export interface InvoiceResponse {
  invoice: Invoice;
}

export interface InvoiceItemsResponse {
  items: InvoiceItem[];
}

export interface InvoicePaymentsResponse {
  payments: InvoicePayment[];
}

// Utility types for invoice statistics
export interface InvoiceStats {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  overdue_amount: number;
  draft_amount: number;
  sent_amount: number;
}

// Invoice validation helpers
export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "cancelled"];

export const INVOICE_STATUS_COLORS = {
  draft: "bg-gray-500",
  sent: "bg-blue-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  cancelled: "bg-gray-700",
} as const;

// Re-export types from job.ts that are used in this file
import { Customer, Job, ServiceType, Profile } from './job';