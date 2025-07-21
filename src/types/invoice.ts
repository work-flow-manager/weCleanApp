import { Database } from './supabase';

// Define the Invoice type based on the database schema
export type Invoice = {
  id: string;
  company_id: string;
  customer_id: string;
  job_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  payment_terms: string | null;
  paid_amount: number;
  paid_date: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  
  // Related data that might be included from joins
  customers?: {
    id: string;
    business_name?: string;
    billing_address?: string;
    service_address?: string;
    profiles?: {
      id: string;
      full_name: string;
      email: string;
      phone?: string;
    }
  };
  jobs?: {
    id: string;
    title: string;
    service_address: string;
    scheduled_date: string;
  };
  invoice_items?: InvoiceItem[];
  invoice_payments?: InvoicePayment[];
};

// Define the InvoiceItem type
export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate: number | null;
  tax_amount: number | null;
  service_type_id: string | null;
  created_at: string;
  
  // Related data
  service_types?: {
    id: string;
    name: string;
    description?: string;
    base_price?: number;
  };
};

// Define the InvoicePayment type
export type InvoicePayment = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
};

// Define the CompanyInvoiceSettings type
export type CompanyInvoiceSettings = {
  company_id: string;
  default_tax_rate: number;
  default_payment_terms: string | null;
  invoice_prefix: string | null;
  invoice_footer: string | null;
  next_invoice_number: number;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

// Request types for API endpoints
export type CreateInvoicePaymentRequest = {
  amount: number;
  payment_method: string;
  payment_date?: string;
  transaction_id?: string;
  notes?: string;
};

export type UpdateInvoiceRequest = {
  issue_date?: string;
  due_date?: string;
  tax_rate?: number;
  notes?: string | null;
  payment_terms?: string | null;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
};

export type CreateInvoiceItemRequest = {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  service_type_id?: string | null;
};

export type CreateInvoiceRequest = {
  customer_id: string;
  job_id?: string;
  issue_date?: string;
  due_date?: string;
  tax_rate?: number;
  notes?: string;
  payment_terms?: string;
  items: CreateInvoiceItemRequest[];
};

export type InvoiceFilters = {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer_id?: string;
  job_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
};

export type InvoiceListResponse = {
  invoices: any[];
  total: number;
  limit: number;
  offset: number;
};

export type InvoiceStats = {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  overdue_amount: number;
  draft_amount: number;
  sent_amount: number;
};

// Extend the Database type to include invoice tables
export type DatabaseWithInvoices = Database & {
  public: {
    Tables: Database['public']['Tables'] & {
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> & { 
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Invoice, 'id'>> & { id?: string };
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice_items: {
        Row: InvoiceItem;
        Insert: Omit<InvoiceItem, 'id' | 'created_at'> & { 
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<InvoiceItem, 'id'>> & { id?: string };
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoice_items_service_type_id_fkey";
            columns: ["service_type_id"];
            isOneToOne: false;
            referencedRelation: "service_types";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice_payments: {
        Row: InvoicePayment;
        Insert: Omit<InvoicePayment, 'id' | 'created_at'> & { 
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<InvoicePayment, 'id'>> & { id?: string };
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoice_payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      company_invoice_settings: {
        Row: CompanyInvoiceSettings;
        Insert: Omit<CompanyInvoiceSettings, 'created_at' | 'updated_at'> & { 
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CompanyInvoiceSettings, 'company_id'>> & { company_id?: string };
        Relationships: [
          {
            foreignKeyName: "company_invoice_settings_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: true;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
    }
  }
}