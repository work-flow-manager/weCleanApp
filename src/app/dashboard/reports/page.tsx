"use client"

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ReportTemplateForm, ReportTemplateCard, SavedReportCard } from '@/components/reports';
import { ReportService } from '@/lib/services/report-service';
import { ReportTemplate, SavedReport, ReportGenerationOptions } from '@/types/report';
import { Plus, FileText, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<string>('sample-business-id'); // In a real app, get this from auth context
  
  // Fetch report templates and saved reports
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch templates
        const templates = await ReportService.getReportTemplates(businessId);
        setTemplates(templates);
        
        // Fetch saved reports
        const savedReports = await ReportService.getSavedReports(businessId);
        setSavedReports(savedReports);
      } catch (error) {
        console.error('Error fetching reports data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reports data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [businessId, toast]);
  
  // Handle create template
  const handleCreateTemplate = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      const newTemplate = await ReportService.createReportTemplate(businessId, values);
      
      if (newTemplate) {
        setTemplates([newTemplate, ...templates]);
        setIsCreateDialogOpen(false);
        
        toast({
          title: 'Success',
          description: 'Report template created successfully.'
        });
      } else {
        throw new Error('Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create report template. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit template
  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };
  
  // Handle update template
  const handleUpdateTemplate = async (values: any) => {
    if (!selectedTemplate) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedTemplate = await ReportService.updateReportTemplate(selectedTemplate.id, values);
      
      if (updatedTemplate) {
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
        setIsEditDialogOpen(false);
        setSelectedTemplate(null);
        
        toast({
          title: 'Success',
          description: 'Report template updated successfully.'
        });
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report template. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete template
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const success = await ReportService.deleteReportTemplate(templateId);
      
      if (success) {
        setTemplates(templates.filter(t => t.id !== templateId));
        
        toast({
          title: 'Success',
          description: 'Report template deleted successfully.'
        });
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report template. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle generate report
  const handleGenerateReport = async (templateId: string, options: ReportGenerationOptions) => {
    try {
      const result = await ReportService.generateReport(businessId, {
        ...options,
        templateId
      });
      
      if (result) {
        // Add the new report to the saved reports list
        setSavedReports([result as unknown as SavedReport, ...savedReports]);
        
        toast({
          title: 'Success',
          description: 'Report generated successfully.'
        });
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive'
      });
      throw error; // Re-throw to handle in the component
    }
  };
  
  // Handle download report
  const handleDownloadReport = (report: SavedReport) => {
    // In a real implementation, this would trigger a download
    // For now, we'll just open the URL in a new tab
    window.open(report.url, '_blank');
    
    toast({
      title: 'Download Started',
      description: `Downloading ${report.name}.`
    });
  };
  
  // Handle delete saved report
  const handleDeleteSavedReport = async (reportId: string) => {
    try {
      const success = await ReportService.deleteSavedReport(reportId);
      
      if (success) {
        setSavedReports(savedReports.filter(r => r.id !== reportId));
        
        toast({
          title: 'Success',
          description: 'Report deleted successfully.'
        });
      } else {
        throw new Error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Create, manage, and generate reports for your business
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>
      
      <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No report templates</h3>
              <p className="text-muted-foreground mb-4">
                Create your first report template to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <ReportTemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onGenerate={handleGenerateReport}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : savedReports.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate a report from a template to see it here
              </p>
              <Button onClick={() => setActiveTab('templates')}>
                View Templates
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedReports.map(report => (
                <SavedReportCard
                  key={report.id}
                  report={report}
                  onDownload={handleDownloadReport}
                  onDelete={handleDeleteSavedReport}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <ReportTemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedTemplate && (
            <ReportTemplateForm
              template={selectedTemplate}
              onSubmit={handleUpdateTemplate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTemplate(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}