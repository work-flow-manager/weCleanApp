"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  JobCompletionVerification, 
  PhotoVerificationReview, 
  CustomerPhotoNotification 
} from "@/components/jobs";
import { CheckCircle2, AlertCircle, Camera, ClipboardCheck, Mail } from "lucide-react";
import { PhotoUploadResult } from "@/lib/services/photoUpload";
import { useAuth } from "@/contexts/AuthContext";

// Sample job data for demonstration
const sampleJob = {
  id: "job123",
  title: "Regular Cleaning - Johnson Residence",
  address: "123 Main St, San Francisco, CA",
  date: "July 20, 2025",
  time: "9:00 AM",
  status: "in-progress",
  customer: {
    id: "cust123",
    name: "Alice Johnson",
    email: "alice@example.com"
  }
};

// Sample photos for demonstration
const samplePhotos: PhotoUploadResult[] = [
  {
    id: "photo1",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1170&auto=format&fit=crop",
    category: "before",
    caption: "Kitchen before cleaning",
    createdAt: "2025-07-20T09:15:00Z"
  },
  {
    id: "photo2",
    url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1168&auto=format&fit=crop",
    category: "after",
    caption: "Kitchen after cleaning",
    createdAt: "2025-07-20T11:30:00Z"
  },
  {
    id: "photo3",
    url: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?q=80&w=1171&auto=format&fit=crop",
    category: "before",
    caption: "Bathroom before cleaning",
    createdAt: "2025-07-20T09:20:00Z"
  },
  {
    id: "photo4",
    url: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=1170&auto=format&fit=crop",
    category: "after",
    caption: "Bathroom after cleaning",
    createdAt: "2025-07-20T11:45:00Z"
  }
];

export default function JobVerificationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("completion");
  const [photos, setPhotos] = useState<PhotoUploadResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "submitted" | "approved" | "rejected">("pending");
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  // Load job data and photos
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPhotos(samplePhotos);
      setIsLoading(false);
      
      // Set initial tab based on user role and verification status
      if (user?.role === "team") {
        setActiveTab("completion");
      } else if (user?.role === "manager" || user?.role === "admin") {
        setActiveTab("review");
      } else {
        setActiveTab("completion");
      }
    }, 1000);
  }, [id, user?.role]);

  // Handle job completion
  const handleJobCompletion = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update verification status
    setVerificationStatus("submitted");
    
    // Switch to review tab if manager/admin
    if (user?.role === "manager" || user?.role === "admin") {
      setActiveTab("review");
    }
    
    return true;
  };

  // Handle verification approval
  const handleVerificationApprove = async (feedback: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update verification status
    setVerificationStatus("approved");
    
    // Switch to notification tab
    setActiveTab("notification");
    
    return true;
  };

  // Handle verification rejection
  const handleVerificationReject = async (reason: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update verification status
    setVerificationStatus("rejected");
    
    return true;
  };

  // Handle customer notification
  const handleSendNotification = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update notification status
    setNotificationSent(true);
    
    return true;
  };

  return (
    <>
      <Helmet>
        <title>Job Verification | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading={`Verification: ${sampleJob.title}`}
          text="Complete the verification process for this job"
          icon={<ClipboardCheck className="h-6 w-6 text-pink-500" />}
        >
          <div className="flex items-center gap-2">
            <Badge className={
              verificationStatus === "approved" ? "bg-green-100 text-green-800 border-green-200" :
              verificationStatus === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
              verificationStatus === "submitted" ? "bg-amber-100 text-amber-800 border-amber-200" :
              "bg-gray-100 text-gray-800 border-gray-200"
            }>
              {verificationStatus === "approved" ? "Approved" :
               verificationStatus === "rejected" ? "Rejected" :
               verificationStatus === "submitted" ? "Pending Review" :
               "Not Started"}
            </Badge>
            
            {notificationSent && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Customer Notified
              </Badge>
            )}
          </div>
        </DashboardHeader>
        
        <div className="grid gap-6">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="completion">Job Completion</TabsTrigger>
              <TabsTrigger value="review">Manager Review</TabsTrigger>
              <TabsTrigger value="notification">Customer Notification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="completion" className="space-y-6">
              {verificationStatus === "pending" ? (
                <JobCompletionVerification
                  jobId={id as string}
                  onComplete={handleJobCompletion}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Job Completion Verified
                    </CardTitle>
                    <CardDescription>
                      This job has been marked as completed and is awaiting manager review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-800">Verification Submitted</AlertTitle>
                      <AlertDescription className="text-green-700">
                        You have completed the verification process for this job. A manager will review the photos and approve or reject the verification.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Verification Process</CardTitle>
                  <CardDescription>
                    Understanding the job verification workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      The job verification process ensures that all work is properly documented and completed to satisfaction.
                      Follow these steps to complete the verification:
                    </p>
                    
                    <ol className="space-y-2 list-decimal list-inside">
                      <li className="text-sm">
                        <span className="font-medium">Complete all cleaning tasks</span> according to the job requirements.
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Upload before and after photos</span> to document the work performed.
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Submit the verification</span> for manager review.
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Wait for manager approval</span> before notifying the customer.
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="review" className="space-y-6">
              <PhotoVerificationReview
                jobId={id as string}
                photos={photos}
                isLoading={isLoading}
                onApprove={handleVerificationApprove}
                onReject={handleVerificationReject}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Manager Review Guidelines</CardTitle>
                  <CardDescription>
                    How to properly review job verification photos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      As a manager, your review ensures that work meets quality standards and is properly documented.
                      Follow these guidelines when reviewing job verifications:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Photo Quality</h4>
                        <p className="text-sm text-muted-foreground">
                          Ensure photos are clear, well-lit, and show the relevant areas. Both before and after photos
                          should be taken from similar angles for proper comparison.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Work Quality</h4>
                        <p className="text-sm text-muted-foreground">
                          Verify that the after photos demonstrate thorough cleaning and meet our quality standards.
                          All areas mentioned in the job requirements should be addressed.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notification" className="space-y-6">
              {verificationStatus === "approved" ? (
                <CustomerPhotoNotification
                  jobId={id as string}
                  customerName={sampleJob.customer.name}
                  customerEmail={sampleJob.customer.email}
                  photos={photos}
                  isLoading={isLoading}
                  onSend={handleSendNotification}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Verification Not Approved
                    </CardTitle>
                    <CardDescription>
                      The job verification must be approved before notifying the customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <AlertTitle className="text-amber-800">Approval Required</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        A manager must review and approve the job verification before you can send a notification to the customer.
                        {verificationStatus === "rejected" && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab("completion")}
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Update Verification
                            </Button>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Customer Communication</CardTitle>
                  <CardDescription>
                    Best practices for customer notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Effective customer communication helps build trust and satisfaction. Follow these best practices
                      when sending job completion notifications:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Professional Tone</h4>
                        <p className="text-sm text-muted-foreground">
                          Maintain a professional and friendly tone in all communications. Thank the customer for their
                          business and invite them to provide feedback.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Visual Evidence</h4>
                        <p className="text-sm text-muted-foreground">
                          Include before and after photos to showcase the quality of work. This visual evidence helps
                          customers appreciate the value of the service provided.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardShell>
    </>
  );
}