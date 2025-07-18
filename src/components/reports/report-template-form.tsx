"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ReportTemplate, ReportSection, ReportFilter, ReportSchedule } from '@/types/report';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define form schema with zod
const reportTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        'business_overview',
        'team_performance',
        'customer_analytics',
        'job_analytics',
        'financial_analytics',
        'location_analytics'
      ]),
      title: z.string(),
      metrics: z.array(z.string()),
      charts: z.array(z.string()),
      sort_order: z.number()
    })
  ).min(1, 'At least one section is required'),
  filters: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['timeframe', 'team_member', 'service_type', 'location', 'customer']),
      value: z.union([z.string(), z.array(z.string())])
    })
  ),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    day: z.number().optional(),
    time: z.string(),
    recipients: z.array(z.string()),
    format: z.enum(['pdf', 'csv', 'excel'])
  }).optional()
});

type FormValues = z.infer<typeof reportTemplateSchema>;

interface ReportTemplateFormProps {
  template?: ReportTemplate;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ReportTemplateForm({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ReportTemplateFormProps) {
  const [activeTab, setActiveTab] = useState('sections');
  const [enableSchedule, setEnableSchedule] = useState(!!template?.schedule);
  
  // Available section types
  const sectionTypes = [
    { value: 'business_overview', label: 'Business Overview' },
    { value: 'team_performance', label: 'Team Performance' },
    { value: 'customer_analytics', label: 'Customer Analytics' },
    { value: 'job_analytics', label: 'Job Analytics' },
    { value: 'financial_analytics', label: 'Financial Analytics' },
    { value: 'location_analytics', label: 'Location Analytics' }
  ];
  
  // Available filter types
  const filterTypes = [
    { value: 'timeframe', label: 'Time Frame' },
    { value: 'team_member', label: 'Team Member' },
    { value: 'service_type', label: 'Service Type' },
    { value: 'location', label: 'Location' },
    { value: 'customer', label: 'Customer' }
  ];
  
  // Available metrics by section type
  const metricsBySection: Record<string, { value: string, label: string }[]> = {
    business_overview: [
      { value: 'total_revenue', label: 'Total Revenue' },
      { value: 'total_jobs', label: 'Total Jobs' },
      { value: 'average_job_value', label: 'Average Job Value' },
      { value: 'customer_satisfaction', label: 'Customer Satisfaction' }
    ],
    team_performance: [
      { value: 'average_rating', label: 'Average Rating' },
      { value: 'jobs_completed', label: 'Jobs Completed' },
      { value: 'on_time_percentage', label: 'On-Time Percentage' },
      { value: 'team_members', label: 'Team Member Performance' }
    ],
    // Add metrics for other section types...
  };
  
  // Available charts by section type
  const chartsBySection: Record<string, { value: string, label: string }[]> = {
    business_overview: [
      { value: 'revenue_chart', label: 'Revenue Over Time' },
      { value: 'jobs_chart', label: 'Jobs Completed' }
    ],
    team_performance: [
      { value: 'efficiency_chart', label: 'Team Efficiency Over Time' }
    ],
    // Add charts for other section types...
  };
  
  // Initialize form with template data or defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(reportTemplateSchema),
    defaultValues: template ? {
      name: template.name,
      description: template.description,
      sections: template.sections,
      filters: template.filters,
      schedule: template.schedule
    } : {
      name: '',
      description: '',
      sections: [{
        id: `section-${Date.now()}`,
        type: 'business_overview',
        title: 'Business Overview',
        metrics: ['total_revenue', 'total_jobs'],
        charts: ['revenue_chart'],
        sort_order: 0
      }],
      filters: [{
        id: `filter-${Date.now()}`,
        type: 'timeframe',
        value: 'last_30_days'
      }]
    }
  });
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // If schedule is not enabled, remove it from the values
    if (!enableSchedule) {
      delete values.schedule;
    }
    
    onSubmit(values);
  };
  
  // Add a new section
  const addSection = () => {
    const sections = form.getValues('sections');
    form.setValue('sections', [
      ...sections,
      {
        id: `section-${Date.now()}`,
        type: 'business_overview',
        title: 'Business Overview',
        metrics: [],
        charts: [],
        sort_order: sections.length
      }
    ]);
  };
  
  // Remove a section
  const removeSection = (index: number) => {
    const sections = form.getValues('sections');
    sections.splice(index, 1);
    
    // Update sort_order for remaining sections
    sections.forEach((section, i) => {
      section.sort_order = i;
    });
    
    form.setValue('sections', sections);
  };
  
  // Add a new filter
  const addFilter = () => {
    const filters = form.getValues('filters');
    form.setValue('filters', [
      ...filters,
      {
        id: `filter-${Date.now()}`,
        type: 'timeframe',
        value: 'last_30_days'
      }
    ]);
  };
  
  // Remove a filter
  const removeFilter = (index: number) => {
    const filters = form.getValues('filters');
    filters.splice(index, 1);
    form.setValue('filters', filters);
  };
  
  // Handle drag and drop for sections
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sections = form.getValues('sections');
    const [reorderedItem] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedItem);
    
    // Update sort_order for all sections
    sections.forEach((section, i) => {
      section.sort_order = i;
    });
    
    form.setValue('sections', sections);
  };
  
  // Toggle schedule
  const toggleSchedule = (checked: boolean) => {
    setEnableSchedule(checked);
    
    if (checked && !form.getValues('schedule')) {
      form.setValue('schedule', {
        frequency: 'weekly',
        day: 1, // Monday
        time: '09:00',
        recipients: [],
        format: 'pdf'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Name</FormLabel>
                <FormControl>
                  <Input placeholder="Monthly Performance Report" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-schedule"
              checked={enableSchedule}
              onCheckedChange={toggleSchedule}
            />
            <label
              htmlFor="enable-schedule"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Schedule this report
              </div>
            </label>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A comprehensive report of business performance metrics"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            {enableSchedule && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="sections" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Report Sections</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {form.watch('sections').map((section, index) => (
                      <Draggable
                        key={section.id}
                        draggableId={section.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border"
                          >
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <CardTitle className="text-base flex-1 ml-2">
                                Section {index + 1}
                              </CardTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSection(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Section Type</FormLabel>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select section type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {sectionTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                              {type.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Section Title</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              {/* Metrics selection would go here */}
                              {/* Charts selection would go here */}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Report Filters</h3>
              <Button type="button" variant="outline" size="sm" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
            </div>
            
            <div className="space-y-4">
              {form.watch('filters').map((filter, index) => (
                <Card key={filter.id} className="border">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">Filter {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <FormField
                      control={form.control}
                      name={`filters.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filter Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select filter type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filterTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Filter value selection would go here */}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {enableSchedule && (
            <TabsContent value="schedule" className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Schedule Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="schedule.frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('schedule.frequency') === 'weekly' && (
                  <FormField
                    control={form.control}
                    name="schedule.day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch('schedule.frequency') === 'monthly' && (
                  <FormField
                    control={form.control}
                    name="schedule.day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Month</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={31}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="schedule.time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="schedule.format"
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
              </div>
              
              {/* Recipients would go here */}
            </TabsContent>
          )}
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
}