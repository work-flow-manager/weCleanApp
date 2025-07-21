"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BeforeAfterUploader } from "@/components/photos";
import { Loader2, CheckCircle2, AlertCircle, Camera, ClipboardCheck, X } from "lucide-react";

interface JobCompletionVerificationProps {
  jobId: string;
  onComplete?: (data: JobCompletionData) => Promise<boolean>;
  onCancel?: () => void;
  className?: string;
}

export interface JobCompletionData {
  jobId: string;
  completionNotes: string;
  tasksCompleted: boolean;
  photosUploaded: boolean;
  customerNotified: boolean;
}

export default function JobCompletionVerification({
  jobId,
  onComplete,
  onCancel,
  className = "",
}: JobCompletionVerificationProps) {
  const [activeTab, setActiveTab] = useState<string>("checklist");
  const [completionNotes, setCompletionNotes] = useState<string>("");
  const [tasksCompleted, setTasksCompleted] = useState<boolean>(false);
  const [photosUploaded, setPhotosUploaded] = useState<boolean>(false);
  const [customerNotified, setCustomerNotified] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [photoRequirementMet, setPhotoRequirementMet] = useState<boolean>(false);

  // Check if all required steps are completed
  const isReadyToComplete = tasksCompleted && photosUploaded;

  // Handle photo verification complete
  const handlePhotoVerificationComplete = () => {
    setPhotosUploaded(true);
    setPhotoRequirementMet(true);
    setActiveTab("checklist");
    
    toast({
      title: "Photos Uploaded",
      description: "Before and after photos have been successfully uploaded.",
    });
  };

  // Handle job completion
  const handleComplete = async () => {
    if (!isReadyToComplete) {
      toast({
        title: "Cannot Complete Job",
        description: "Please ensure all required steps are completed.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onComplete) {
        const success = await onComplete({
          jobId,
          completionNotes,
          tasksCompleted,
          photosUploaded,
          customerNotified,
        });
        
        if (success) {
          toast({
            title: "Job Completed",
            description: "The job has been marked as completed successfully.",
          });
        } else {
          throw new Error("Failed to complete job");
        }
      }
    } catch (error) {
      console.error("Error completing job:", error);
      toast({
        title: "Error",
        description: "Failed to complete the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-pink-500" />
            Job Completion Verification
          </CardTitle>
          <CardDescription>
            Complete the verification process to mark this job as completed
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="checklist" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="checklist" className="relative">
                Completion Checklist
                {isReadyToComplete && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="photos" className="relative">
                Photo Verification
                {photoRequirementMet && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="checklist" className="pt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="tasks-completed"
                    checked={tasksCompleted}
                    onCheckedChange={(checked) => setTasksCompleted(checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="tasks-completed"
                      className="font-medium"
                    >
                      All cleaning tasks have been completed
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Confirm that all required cleaning tasks for this job have been completed to satisfaction.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="photos-uploaded"
                    checked={photosUploaded}
                    onCheckedChange={(checked) => setPhotosUploaded(checked === true)}
                    disabled={!photoRequirementMet}
                  />
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="photos-uploaded"
                      className="font-medium"
                    >
                      Before and after photos have been uploaded
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Confirm that you have uploaded before and after photos to document the work.
                      {!photoRequirementMet && (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-pink-500"
                          onClick={() => setActiveTab("photos")}
                        >
                          Upload photos now
                        </Button>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="customer-notified"
                    checked={customerNotified}
                    onCheckedChange={(checked) => setCustomerNotified(checked === true)}
                  />
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="customer-notified"
                      className="font-medium"
                    >
                      Customer has been notified of completion
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Confirm that the customer has been notified that the job is complete.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
                  <Textarea
                    id="completion-notes"
                    placeholder="Add any notes about the job completion..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                  />
                </div>
              </div>
              
              {!isReadyToComplete && (
                <Alert className="mt-4 border-amber-500 bg-amber-50 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Required</AlertTitle>
                  <AlertDescription>
                    Please complete all required steps before marking the job as complete.
                    {!photoRequirementMet && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("photos")}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Upload Photos
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="photos" className="pt-4">
              <BeforeAfterUploader
                jobId={jobId}
                onComplete={handlePhotoVerificationComplete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            onClick={() => setConfirmDialogOpen(true)}
            disabled={!isReadyToComplete || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Job as Complete
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Confirmation dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Job Completion</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this job as complete? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Completion Checklist:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${tasksCompleted ? "text-green-500" : "text-gray-300"}`} />
                  All cleaning tasks completed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${photosUploaded ? "text-green-500" : "text-gray-300"}`} />
                  Before and after photos uploaded
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${customerNotified ? "text-green-500" : "text-gray-300"}`} />
                  Customer notified of completion
                </li>
              </ul>
            </div>
            
            {completionNotes && (
              <div className="space-y-2">
                <h4 className="font-medium">Completion Notes:</h4>
                <p className="text-sm text-muted-foreground">{completionNotes}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}