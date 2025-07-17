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
import { TeamMember } from "@/types/job";

// Form validation schema
const assignmentFormSchema = z.object({
  team_member_id: z.string().min(1, "Team member is required"),
  role: z.enum(["cleaner", "lead", "supervisor"]).default("cleaner"),
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

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      team_member_id: "",
      role: "cleaner",
    },
  });

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/team-members");
        
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.teamMembers || []);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsSubmitting(true);

      await JobsAPI.assignTeamMember(jobId, {
        team_member_id: data.team_member_id,
        role: data.role,
      });

      toast({
        title: "Team Member Assigned",
        description: "The team member has been assigned to this job.",
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
        description: error instanceof Error ? error.message : "Failed to assign team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
      <CardHeader>
        <CardTitle>Assign Team Member</CardTitle>
        <CardDescription>
          Assign a team member to this job
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="team_member_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.profiles?.full_name || "Unknown"}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="lead">Team Lead</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The role this team member will have on this job
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Team Member
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}