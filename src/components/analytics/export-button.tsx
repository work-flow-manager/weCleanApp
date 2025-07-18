"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AnalyticsFilters, ExportFormat, ExportOptions } from '@/types/analytics';
import { DownloadIcon, Loader2 } from 'lucide-react';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { useToast } from '@/components/ui/use-toast';

interface ExportButtonProps {
  businessId: string;
  filters: AnalyticsFilters;
  className?: string;
}

export function ExportButton({ businessId, filters, className }: ExportButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [sections, setSections] = useState<string[]>([
    'business_overview',
    'team_performance',
    'job_analytics',
    'financial_analytics'
  ]);
  const [includeCharts, setIncludeCharts] = useState(true);
  
  // Available sections
  const availableSections = [
    { id: 'business_overview', label: 'Business Overview' },
    { id: 'team_performance', label: 'Team Performance' },
    { id: 'customer_analytics', label: 'Customer Analytics' },
    { id: 'job_analytics', label: 'Job Analytics' },
    { id: 'financial_analytics', label: 'Financial Analytics' },
    { id: 'location_analytics', label: 'Location Analytics' }
  ];
  
  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    setSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };
  
  // Handle export
  const handleExport = async () => {
    if (sections.length === 0) {
      toast({
        title: 'Export Error',
        description: 'Please select at least one section to export',
        variant: 'destructive'
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        format,
        sections,
        include_charts: includeCharts,
        timeframe: filters.timeframe
      };
      
      const downloadUrl = await AnalyticsService.exportAnalyticsData(
        businessId,
        filters,
        options
      );
      
      if (downloadUrl) {
        // In a real implementation, this would trigger a download
        // For now, we'll just show a success message
        toast({
          title: 'Export Successful',
          description: `Your ${format.toUpperCase()} export is ready for download.`
        });
        
        // Simulate download by opening in a new tab
        window.open(downloadUrl, '_blank');
      } else {
        throw new Error('Failed to generate export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Error',
        description: 'Failed to generate export. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Export Analytics</h4>
          
          <div className="space-y-2">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Sections</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableSections.map(section => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={sections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label htmlFor={section.id} className="text-sm">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-charts"
              checked={includeCharts}
              onCheckedChange={(checked) => setIncludeCharts(!!checked)}
            />
            <Label htmlFor="include-charts">Include charts</Label>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleExport}
            disabled={isExporting || sections.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}