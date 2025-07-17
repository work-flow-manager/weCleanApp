"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { JobsAPI } from "@/lib/jobs";
import { JobStatus } from "@/types/job";

// Form validation schema
const updateFormSchema = z.object({
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled", "issue"]).optional(),
  notes: z.string().min(1, "Notes are required"),
});

type UpdateFormData = z.infer<typeof updateFormSchema>;

interface JobUpdateFormProps {
  jobId: string;
  currentStatus: JobStatus;
  onSuccess?: () => void;
}

export function JobUpdateForm({ jobId, currentStatus, onSuccess }: JobUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      status: undefined,
      notes: "",
    },
  });

  const onSubmit = async (data: UpdateFormData) => {
    try {
      setIsSubmitting(true);

      await JobsAPI.createJobUpdate(jobId, {
        status: data.status,
        notes: data.notes,
      });

      toast({
        title: "Update Added",
        description: "The job update has been added successfully.",
      });

      // Reset form
      form.reset();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding job update:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add job update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
      <CardHeader>
        <CardTitle>Add Update</CardTitle>
        <CardDescription>
          Add a status update or notes to this job
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Update status (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="issue">Issue Reported</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Leave blank to keep the current status ({currentStatus})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter update notes..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about the job progress or any issues
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Update
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}