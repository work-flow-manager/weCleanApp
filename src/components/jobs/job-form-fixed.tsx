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
import { Job, CreateJobRequest, UpdateJobRequest, ServiceType, Customer, JobPriority } from "@/types/job";

// Form validation schema
const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  service_address: z.string().min(1, "Service address is required"),
  scheduled_date: z.date(),
  scheduled_time: z.string().min(1, "Scheduled time is required"),
  customer_id: z.string().min(1, "Customer is required"),
  service_type_id: z.string().min(1, "Service type is required"),
  estimated_duration: z.number().min(30, "Duration must be at least 30 minutes").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"] as const),
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

  // Load service types and customers
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load service types
        const serviceTypesResponse = await fetch('/api/service-types');
        if (serviceTypesResponse.ok) {
          const data = await serviceTypesResponse.json();
          setServiceTypes(data.service_types || []);
        }
        
        // Load customers
        const customersResponse = await fetch('/api/customers');
        if (customersResponse.ok) {
          const data = await customersResponse.json();
          setCustomers(data.customers || []);
        }
        
        // Load managers
        const managersResponse = await fetch('/api/team-members?role=manager');
        if (managersResponse.ok) {
          const data = await managersResponse.json();
          setManagers(data.team_members || []);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const form = useForm<JobFormData>({
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      service_address: job?.service_address || "",
      scheduled_date: job?.scheduled_date ? new Date(job.scheduled_date) : new Date(),
      scheduled_time: job?.scheduled_time || "",
      customer_id: job?.customer_id || "",
      service_type_id: job?.service_type_id || "",
      estimated_duration: job?.estimated_duration || undefined,
      priority: (job?.priority as JobPriority) || "medium",
      special_instructions: job?.special_instructions || "",
      estimated_price: job?.estimated_price || undefined,
      assigned_manager: job?.assigned_manager || "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    
    try {
      // Format the data for API
      const jobData: CreateJobRequest | UpdateJobRequest = {
        title: data.title,
        description: data.description,
        service_address: data.service_address,
        scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
        scheduled_time: data.scheduled_time,
        customer_id: data.customer_id,
        service_type_id: data.service_type_id,
        estimated_duration: data.estimated_duration,
        priority: data.priority,
        special_instructions: data.special_instructions,
        estimated_price: data.estimated_price,
        assigned_manager: data.assigned_manager,
      };
      
      let result;
      
      if (job) {
        // Update existing job
        result = await JobsAPI.updateJob(job.id, jobData as UpdateJobRequest);
        toast({
          title: "Job Updated",
          description: "The job has been updated successfully.",
        });
      } else {
        // Create new job
        result = await JobsAPI.createJob(jobData as CreateJobRequest);
        toast({
          title: "Job Created",
          description: "The job has been created successfully.",
        });
      }
      
      if (onSuccess && result.job) {
        onSuccess(result.job);
      } else {
        router.push(`/jobs/${result.job.id}`);
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading form data...</span>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{job ? "Edit Job" : "Create New Job"}</CardTitle>
        <CardDescription>
          {job ? "Update the job details below" : "Fill in the details to create a new job"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input 
                id="title"
                placeholder="Enter job title" 
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer *</Label>
              <Select 
                onValueChange={(value) => form.setValue("customer_id", value)}
                defaultValue={form.getValues("customer_id")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.business_name || customer.profiles?.full_name || "Unknown Customer"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.customer_id && (
                <p className="text-sm text-destructive">{form.formState.errors.customer_id.message}</p>
              )}
            </div>
            
            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="service_type_id">Service Type *</Label>
              <Select 
                onValueChange={(value) => form.setValue("service_type_id", value)}
                defaultValue={form.getValues("service_type_id")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} {type.base_price && `- $${type.base_price}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.service_type_id && (
                <p className="text-sm text-destructive">{form.formState.errors.service_type_id.message}</p>
              )}
            </div>
            
            {/* Service Address */}
            <div className="space-y-2">
              <Label htmlFor="service_address">Service Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="service_address"
                  placeholder="Enter service address" 
                  className="pl-8"
                  {...form.register("service_address")}
                />
              </div>
              {form.formState.errors.service_address && (
                <p className="text-sm text-destructive">{form.formState.errors.service_address.message}</p>
              )}
            </div>
            
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                onValueChange={(value) => form.setValue("priority", value as JobPriority)}
                defaultValue={form.getValues("priority")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-destructive">{form.formState.errors.priority.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {job ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}