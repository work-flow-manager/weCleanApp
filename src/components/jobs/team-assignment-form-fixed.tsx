"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { JobsAPI } from "@/lib/jobs";
import { TeamMember, AssignmentRole } from "@/types/job";

// Form validation schema
const assignmentFormSchema = z.object({
  team_member_id: z.string().min(1, "Team member is required"),
  role: z.enum(["cleaner", "lead", "supervisor"] as const),
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

interface TeamAssignmentFormProps {
  jobId: string;
  onSuccess?: () => void;
}

export function TeamAssignmentForm({ jobId, onSuccess }: TeamAssignmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/team-members');
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.team_members || []);
        } else {
          throw new Error('Failed to load team members');
        }
      } catch (error) {
        console.error("Error loading team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamMembers();
  }, []);

  const form = useForm<AssignmentFormData>({
    defaultValues: {
      team_member_id: "",
      role: "cleaner" as AssignmentRole,
    },
  });

  // Handle form submission
  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);
    
    try {
      await JobsAPI.assignTeamMember(jobId, {
        team_member_id: data.team_member_id,
        role: data.role,
      });
      
      toast({
        title: "Team Member Assigned",
        description: "The team member has been assigned to the job successfully.",
      });
      
      // Reset form
      form.reset();
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error assigning team member:", error);
      toast({
        title: "Error",
        description: "Failed to assign team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Team Member</CardTitle>
        <CardDescription>
          Add a team member to this job
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="team_member_id" className="text-sm font-medium">
              Team Member
            </label>
            <Select 
              onValueChange={(value) => form.setValue("team_member_id", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.profiles?.full_name || "Unknown Member"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.team_member_id && (
              <p className="text-sm text-destructive">{form.formState.errors.team_member_id.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Select 
              onValueChange={(value) => form.setValue("role", value as AssignmentRole)}
              defaultValue="cleaner"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleaner">Cleaner</SelectItem>
                <SelectItem value="lead">Team Lead</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
            )}
          </div>
          
          <Button 
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Team Member
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}