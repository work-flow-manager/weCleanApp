export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_invoice_settings: {
        Row: {
          company_id: string
          default_tax_rate: number
          default_payment_terms: string | null
          invoice_prefix: string | null
          invoice_footer: string | null
          next_invoice_number: number
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          default_tax_rate?: number
          default_payment_terms?: string | null
          invoice_prefix?: string | null
          invoice_footer?: string | null
          next_invoice_number?: number
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          default_tax_rate?: number
          default_payment_terms?: string | null
          invoice_prefix?: string | null
          invoice_footer?: string | null
          next_invoice_number?: number
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invoice_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          billing_address: string | null
          business_name: string | null
          company_id: string | null
          created_at: string | null
          customer_type: string | null
          id: string
          profile_id: string | null
          service_address: string | null
          special_instructions: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          business_name?: string | null
          company_id?: string | null
          created_at?: string | null
          customer_type?: string | null
          id?: string
          profile_id?: string | null
          service_address?: string | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          business_name?: string | null
          company_id?: string | null
          created_at?: string | null
          customer_type?: string | null
          id?: string
          profile_id?: string | null
          service_address?: string | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          customer_id: string
          job_id: string | null
          invoice_number: string
          issue_date: string
          due_date: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          status: string
          notes: string | null
          payment_terms: string | null
          paid_amount: number
          paid_date: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          customer_id: string
          job_id?: string | null
          invoice_number?: string
          issue_date?: string
          due_date: string
          subtotal: number
          tax_amount?: number
          tax_rate?: number
          total_amount: number
          status?: string
          notes?: string | null
          payment_terms?: string | null
          paid_amount?: number
          paid_date?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          customer_id?: string
          job_id?: string | null
          invoice_number?: string
          issue_date?: string
          due_date?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          status?: string
          notes?: string | null
          payment_terms?: string | null
          paid_amount?: number
          paid_date?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          tax_rate: number | null
          tax_amount: number | null
          service_type_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          tax_rate?: number | null
          tax_amount?: number | null
          service_type_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          tax_rate?: number | null
          tax_amount?: number | null
          service_type_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          transaction_id: string | null
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_date?: string
          payment_method: string
          transaction_id?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          transaction_id?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      job_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          job_id: string | null
          role: string | null
          team_member_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          job_id?: string | null
          role?: string | null
          team_member_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          job_id?: string | null
          role?: string | null
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      job_reviews: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          job_id: string | null
          photos: string[] | null
          rating: number | null
          review_text: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          job_id?: string | null
          photos?: string[] | null
          rating?: number | null
          review_text?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          job_id?: string | null
          photos?: string[] | null
          rating?: number | null
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_geofences: {
        Row: {
          id: string
          job_id: string
          radius: number
          notification_on_enter: boolean
          notification_on_exit: boolean
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          radius?: number
          notification_on_enter?: boolean
          notification_on_exit?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          radius?: number
          notification_on_enter?: boolean
          notification_on_exit?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_geofences_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      job_photos: {
        Row: {
          id: string
          job_id: string
          uploaded_by: string
          url: string
          type: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          uploaded_by: string
          url: string
          type: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          uploaded_by?: string
          url?: string
          type?: string
          caption?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      job_updates: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          location: unknown | null
          notes: string | null
          photos: string[] | null
          status: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          location?: unknown | null
          notes?: string | null
          photos?: string[] | null
          status?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          location?: unknown | null
          notes?: string | null
          photos?: string[] | null
          status?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_updates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_updates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_manager: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          estimated_duration: number | null
          estimated_price: number | null
          final_price: number | null
          id: string
          priority: string | null
          scheduled_date: string
          scheduled_time: string
          service_address: string
          service_type_id: string | null
          special_instructions: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_manager?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          priority?: string | null
          scheduled_date: string
          scheduled_time: string
          service_address: string
          service_type_id?: string | null
          special_instructions?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_manager?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          priority?: string | null
          scheduled_date?: string
          scheduled_time?: string
          service_address?: string
          service_type_id?: string | null
          special_instructions?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_manager_fkey"
            columns: ["assigned_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_job_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_job_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_job_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_job_id_fkey"
            columns: ["related_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_types: {
        Row: {
          base_price: number | null
          company_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          required_team_size: number | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          required_team_size?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          required_team_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          profile_id: string
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          profile_id: string
          role: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          profile_id?: string
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          availability: Json | null
          company_id: string | null
          created_at: string | null
          employee_id: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          performance_rating: number | null
          profile_id: string | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability?: Json | null
          company_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          performance_rating?: number | null
          profile_id?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability?: Json | null
          company_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          performance_rating?: number | null
          profile_id?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_with_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          email: string
          full_name: string
          role: string
          avatar_url: string
          phone: string
          address: string
          created_at: string
          updated_at: string
          customer_id: string
          team_member_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
