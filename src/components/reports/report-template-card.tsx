"use client"

import React, { useState } from 'react';
import { ReportTemplate } from '@/types/report';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReportGenerator } from './report-generator';
import { FileText, MoreVertical, Pencil, Trash2, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReportTemplateCardProps {
  template: ReportTemplate;
  onEdit: (template: ReportTemplate) => void;
  onDelete: (templateId: string) => void;
  onGenerate: (templateId: string, options: any) => Promise<void>;
}

export function ReportTemplateCard({
  template,
  onEdit,
  onDelete,
  onGenerate
}: ReportTemplateCardProps) {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Format date as relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(template.created_at), { addSuffix: true });
  
  // Format schedule frequency
  const formatSchedule = () => {
    if (!template.schedule) return null;
    
    const { frequency, day, time } = template.schedule;
    
    let scheduleText = '';
    if (frequency === 'daily') {
      scheduleText = 'Daily';
    } else if (frequency === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      scheduleText = `Weekly on ${days[day || 0]}`;
    } else if (frequency === 'monthly') {
      scheduleText = `Monthly on day ${day}`;
    }
    
    // Format time (HH:MM)
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `${scheduleText} at ${timeStr}`;
  };
  
  // Handle generate report
  const handleGenerate = async (options: any) => {
    setIsGenerating(true);
    
    try {
      await onGenerate(template.id, options);
      setIsGenerateDialogOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(template.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-muted-foreground">
          Created {formattedDate}
        </div>
      </CardHeader>
      <CardContent>
        {template.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {template.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{template.sections.length} section{template.sections.length !== 1 ? 's' : ''}</span>
          </div>
          
          {template.schedule && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatSchedule()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <ReportGenerator
              template={template}
              onGenerate={handleGenerate}
              onCancel={() => setIsGenerateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}