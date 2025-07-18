import { createClient } from '@/lib/supabase/client';
import {
  ReportTemplate,
  ReportGenerationOptions,
  ReportGenerationResult,
  SavedReport,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest
} from '@/types/report';

/**
 * Service for handling reports
 */
export class ReportService {
  /**
   * Get report templates
   */
  static async getReportTemplates(businessId: string): Promise<ReportTemplate[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching report templates:', error);
        return [];
      }
      
      return data as ReportTemplate[];
    } catch (error) {
      console.error('Error in getReportTemplates:', error);
      return [];
    }
  }
  
  /**
   * Get a report template by ID
   */
  static async getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) {
        console.error('Error fetching report template:', error);
        return null;
      }
      
      return data as ReportTemplate;
    } catch (error) {
      console.error('Error in getReportTemplate:', error);
      return null;
    }
  }
  
  /**
   * Create a report template
   */
  static async createReportTemplate(
    businessId: string,
    template: CreateReportTemplateRequest
  ): Promise<ReportTemplate | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          business_id: businessId,
          name: template.name,
          description: template.description,
          sections: template.sections,
          filters: template.filters,
          schedule: template.schedule,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating report template:', error);
        return null;
      }
      
      return data as ReportTemplate;
    } catch (error) {
      console.error('Error in createReportTemplate:', error);
      return null;
    }
  }
  
  /**
   * Update a report template
   */
  static async updateReportTemplate(
    templateId: string,
    template: UpdateReportTemplateRequest
  ): Promise<ReportTemplate | null> {
    try {
      const supabase = createClient();
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (template.name !== undefined) updateData.name = template.name;
      if (template.description !== undefined) updateData.description = template.description;
      if (template.sections !== undefined) updateData.sections = template.sections;
      if (template.filters !== undefined) updateData.filters = template.filters;
      if (template.schedule !== undefined) updateData.schedule = template.schedule;
      
      const { data, error } = await supabase
        .from('report_templates')
        .update(updateData)
        .eq('id', templateId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating report template:', error);
        return null;
      }
      
      return data as ReportTemplate;
    } catch (error) {
      console.error('Error in updateReportTemplate:', error);
      return null;
    }
  }
  
  /**
   * Delete a report template
   */
  static async deleteReportTemplate(templateId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) {
        console.error('Error deleting report template:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteReportTemplate:', error);
      return false;
    }
  }
  
  /**
   * Generate a report
   */
  static async generateReport(
    businessId: string,
    options: ReportGenerationOptions
  ): Promise<ReportGenerationResult | null> {
    try {
      // In a real implementation, this would call an API to generate the report
      // For now, we'll simulate a successful report generation
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_id: businessId,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const data = await response.json();
      return data as ReportGenerationResult;
    } catch (error) {
      console.error('Error in generateReport:', error);
      return null;
    }
  }
  
  /**
   * Get saved reports
   */
  static async getSavedReports(businessId: string): Promise<SavedReport[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('business_id', businessId)
        .order('generated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching saved reports:', error);
        return [];
      }
      
      return data as SavedReport[];
    } catch (error) {
      console.error('Error in getSavedReports:', error);
      return [];
    }
  }
  
  /**
   * Delete a saved report
   */
  static async deleteSavedReport(reportId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportId);
      
      if (error) {
        console.error('Error deleting saved report:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteSavedReport:', error);
      return false;
    }
  }
}