"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BeforeAfterSlider, PhotoGallery } from "@/components/photos";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Camera, MessageSquare } from "lucide-react";
import { PhotoUploadResult } from "@/lib/services/photoUpload";

interface PhotoVerificationReviewProps {
  jobId: string;
  photos: PhotoUploadResult[];
  isLoading?: boolean;
  onApprove?: (feedback: string) => Promise<boolean>;
  onReject?: (reason: string) => Promise<boolean>;
  className?: string;
}

export default function PhotoVerificationReview({
  jobId,
  photos,
  isLoading = false,
  onApprove,
  onReject,
  className = "",
}: PhotoVerificationReviewProps) {
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [feedback, setFeedback] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">("approve");

  // Get before and after photos
  const beforePhotos = photos.filter(photo => photo.category === "before");
  const afterPhotos = photos.filter(photo => photo.category === "after");

  // Check if verification is complete
  const hasBeforePhotos = beforePhotos.length > 0;
  const hasAfterPhotos = afterPhotos.length > 0;
  const isVerificationComplete = hasBeforePhotos && hasAfterPhotos;

  // Handle approve
  const handleApprove = async () => {
    if (!isVerificationComplete) {
      toast({
        title: "Cannot Approve",
        description: "Verification is incomplete. Both before and after photos are required.",
        variant: "destructive",
      });
      return;
    }
    
    setDialogAction("approve");
    setConfirmDialogOpen(true);
  };

  // Handle reject
  const handleReject = () => {
    setDialogAction("reject");
    setConfirmDialogOpen(true);
  };

  // Handle confirm action
  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    
    try {
      if (dialogAction === "approve" && onApprove) {
        const success = await onApprove(feedback);
        
        if (success) {
          setReviewStatus("approved");
          toast({
            title: "Verification Approved",
            description: "The photo verification has been approved.",
          });
        } else {
          throw new Error("Failed to approve verification");
        }
      } else if (dialogAction === "reject" && onReject) {
        if (!rejectionReason) {
          toast({
            title: "Rejection Reason Required",
            description: "Please provide a reason for rejection.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        const success = await onReject(rejectionReason);
        
        if (success) {
          setReviewStatus("rejected");
          toast({
            title: "Verification Rejected",
            description: "The photo verification has been rejected.",
          });
        } else {
          throw new Error("Failed to reject verification");
        }
      }
      
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error processing verification:", error);
      toast({
        title: "Error",
        description: "Failed to process verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-pink-500" />
            Photo Verification Review
          </CardTitle>
          <CardDescription>
            Review and approve or reject the photo verification for this job
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <>
              {/* Verification status */}
              <div className={`p-4 rounded-md ${
                reviewStatus === "approved" ? "bg-green-50 border border-green-200" :
                reviewStatus === "rejected" ? "bg-red-50 border border-red-200" :
                "bg-amber-50 border border-amber-200"
              }`}>
                <div className="flex items-start gap-3">
                  {reviewStatus === "approved" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : reviewStatus === "rejected" ? (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      reviewStatus === "approved" ? "text-green-800" :
                      reviewStatus === "rejected" ? "text-red-800" :
                      "text-amber-800"
                    }`}>
                      {reviewStatus === "approved" ? "Verification Approved" :
                       reviewStatus === "rejected" ? "Verification Rejected" :
                       "Verification Pending Review"}
                    </h4>
                    <p className={`text-sm ${
                      reviewStatus === "approved" ? "text-green-700" :
                      reviewStatus === "rejected" ? "text-red-700" :
                      "text-amber-700"
                    }`}>
                      {reviewStatus === "approved" ? "You have approved this photo verification." :
                       reviewStatus === "rejected" ? "You have rejected this photo verification." :
                       isVerificationComplete ? 
                         "Please review the before and after photos and approve or reject the verification." :
                         "Verification is incomplete. Both before and after photos are required."}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Photo counts */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-md ${hasBeforePhotos ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Before Photos</div>
                    <div className={`text-sm font-medium ${hasBeforePhotos ? "text-green-600" : "text-red-600"}`}>
                      {beforePhotos.length} photos
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-md ${hasAfterPhotos ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">After Photos</div>
                    <div className={`text-sm font-medium ${hasAfterPhotos ? "text-green-600" : "text-red-600"}`}>
                      {afterPhotos.length} photos
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Before/After comparison */}
              {hasBeforePhotos && hasAfterPhotos && (
                <BeforeAfterSlider
                  beforeImage={beforePhotos[0].url}
                  afterImage={afterPhotos[0].url}
                  beforeCaption={beforePhotos[0].caption || "Before"}
                  afterCaption={afterPhotos[0].caption || "After"}
                />
              )}
              
              {/* All photos */}
              <PhotoGallery
                photos={photos}
                isLoading={isLoading}
              />
              
              {/* Feedback */}
              {reviewStatus === "pending" && (
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Add any feedback about the photo verification..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          {reviewStatus === "pending" && (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading || isSubmitting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              
              <Button
                onClick={handleApprove}
                disabled={isLoading || isSubmitting || !isVerificationComplete}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      
      {/* Confirmation dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" ? "Approve Verification" : "Reject Verification"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "approve" 
                ? "Are you sure you want to approve this photo verification?"
                : "Please provide a reason for rejecting this photo verification."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {dialogAction === "approve" ? (
              <div className="space-y-2">
                <Label htmlFor="confirm-feedback">Feedback (Optional)</Label>
                <Textarea
                  id="confirm-feedback"
                  placeholder="Add any feedback for the team member..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <RadioGroup
                  value={rejectionReason}
                  onValueChange={setRejectionReason}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="insufficient_photos" id="insufficient_photos" />
                    <Label htmlFor="insufficient_photos">Insufficient photos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor_quality" id="poor_quality" />
                    <Label htmlFor="poor_quality">Poor photo quality</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="incomplete_work" id="incomplete_work" />
                    <Label htmlFor="incomplete_work">Work appears incomplete</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other reason</Label>
                  </div>
                </RadioGroup>
                
                {rejectionReason === "other" && (
                  <Textarea
                    placeholder="Please specify the reason for rejection..."
                    value={rejectionReason === "other" ? feedback : ""}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={dialogAction === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={isSubmitting || (dialogAction === "reject" && !rejectionReason)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : dialogAction === "approve" ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}