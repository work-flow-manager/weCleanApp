"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ReportTemplate, ReportGenerationOptions } from '@/types/report';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';

// Define form schema with zod
const reportGeneratorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  format: z.enum(['pdf', 'csv', 'excel']),
  includeCharts: z.boolean().default(true)
});

type FormValues = z.infer<typeof reportGeneratorSchema>;

interface ReportGeneratorProps {
  template: ReportTemplate;
  onGenerate: (options: ReportGenerationOptions) => Promise<void>;
  onCancel: () => void;
  isGenerating?: boolean;
}

export function ReportGenerator({
  template,
  onGenerate,
  onCancel,
  isGenerating = false
}: ReportGeneratorProps) {
  // Initialize form with defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(reportGeneratorSchema),
    defaultValues: {
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      format: 'pdf',
      includeCharts: true
    }
  });
  
  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    const options: ReportGenerationOptions = {
      templateId: template.id,
      name: values.name,
      format: values.format,
      sections: template.sections,
      filters: template.filters,
      includeCharts: values.includeCharts
    };
    
    await onGenerate(options);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Generate Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="includeCharts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Charts</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Include visual charts and graphs in the report
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}