"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon, Clock, DollarSign, Loader2, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { JobsAPI, JobUtils } from "@/lib/jobs";
import { Job, CreateJobRequest, UpdateJobRequest, ServiceType, Customer } from "@/types/job";

// Form validation schema
const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  service_address: z.string().min(1, "Service address is required"),
  scheduled_date: z.date({
    required_error: "Scheduled date is required",
  }),
  scheduled_time: z.string().min(1, "Scheduled time is required"),
  customer_id: z.string().min(1, "Customer is required"),
  service_type_id: z.string().min(1, "Service type is required"),
  estimated_duration: z.number().min(30, "Duration must be at least 30 minutes").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  special_instructions: z.string().optional(),
  estimated_price: z.number().min(0, "Price must be positive").optional(),
  assigned_manager: z.string().optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  job?: Job;
  onSuccess?: (job: Job) => void;
  onCancel?: () => void;
}

export function JobForm({ job, onSuccess, onCancel }: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      service_address: job?.service_address || "",
      scheduled_date: job?.scheduled_date ? new Date(job.scheduled_date) : undefined,
      scheduled_time: job?.scheduled_time || "",
      customer_id: job?.customer_id || "",
      service_type_id: job?.service_type_id || "",
      estimated_duration: job?.estimated_duration || undefined,
      priority: job?.priority || "medium",
      special_instructions: job?.special_instructions || "",
      estimated_price: job?.estimated_price || undefined,
      assigned_manager: job?.assigned_manager || "",
    },
  });

  // Load form data
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoading(true);
        
        // Load service types, customers, and managers
        const [serviceTypesRes, customersRes, managersRes] = await Promise.all([
          fetch("/api/service-types"),
          fetch("/api/customers"),
          fetch("/api/users?role=manager"),
        ]);

        if (serviceTypesRes.ok) {
          const serviceTypesData = await serviceTypesRes.json();
          setServiceTypes(serviceTypesData.serviceTypes || []);
        }

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(customersData.customers || []);
        }

        if (managersRes.ok) {
          const managersData = await managersRes.json();
          setManagers(managersData.users || []);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, []);

  // Handle service type selection to auto-fill duration and price
  const handleServiceTypeChange = (serviceTypeId: string) => {
    const selectedService = serviceTypes.find(st => st.id === serviceTypeId);
    if (selectedService) {
      if (selectedService.duration_minutes) {
        form.setValue("estimated_duration", selectedService.duration_minutes);
      }
      if (selectedService.base_price) {
        form.setValue("estimated_price", selectedService.base_price);
      }
    }
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);

      // Convert form data to API format
      const jobData: CreateJobRequest | UpdateJobRequest = {
        ...data,
        scheduled_date: format(data.scheduled_date, "yyyy-MM-dd"),
        assigned_manager: data.assigned_manager || undefined,
      };

      let result;
      if (job) {
        // Update existing job
        result = await JobsAPI.updateJob(job.id, jobData as UpdateJobRequest);
      } else {
        // Create new job
        result = await JobsAPI.createJob(jobData as CreateJobRequest);
      }

      toast({
        title: job ? "Job Updated" : "Job Created",
        description: job 
          ? "The job has been updated successfully." 
          : "The job has been created successfully.",
      });

      if (onSuccess) {
        onSuccess(result.job);
      } else {
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{job ? "Edit Job" : "Create New Job"}</CardTitle>
        <CardDescription>
          {job ? "Update job details and scheduling information." : "Fill in the details to create a new cleaning job."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Office Deep Clean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of the cleaning job..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide specific details about what needs to be cleaned
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="123 Main St, City, State 12345"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Scheduling & Assignment */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Scheduling & Assignment</h3>
                
                <FormField
                  control={form.control}
                  name="scheduled_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scheduled Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduled_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="time"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.business_name || customer.profiles?.full_name || "Unknown Customer"}
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
                  name="service_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleServiceTypeChange(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes.map((serviceType) => (
                            <SelectItem key={serviceType.id} value={serviceType.id}>
                              <div>
                                <div className="font-medium">{serviceType.name}</div>
                                {serviceType.base_price && (
                                  <div className="text-sm text-muted-foreground">
                                    ${serviceType.base_price} • {JobUtils.formatDuration(serviceType.duration_minutes)}
                                  </div>
                                )}
                              </div>
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
                  name="assigned_manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Manager (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No specific manager</SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Duration (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            placeholder="120"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Estimated time to complete the job
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="150.00"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Estimated cost for the service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="special_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requirements, access instructions, or notes..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional instructions for the cleaning team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel || (() => router.back())}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {job ? "Update Job" : "Create Job"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}