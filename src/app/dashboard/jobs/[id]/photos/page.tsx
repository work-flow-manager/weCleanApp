"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera, Image, Check, AlertCircle } from "lucide-react";
import PhotoUploader from "@/components/photos/PhotoUploader";
import BeforeAfterUploader from "@/components/photos/BeforeAfterUploader";
import { getJobPhotos, PhotoUploadResult, PhotoCategory } from "@/lib/services/photoUpload";

// Sample job data for demonstration
const sampleJob = {
  id: "job123",
  title: "Regular Cleaning - Johnson Residence",
  address: "123 Main St, San Francisco, CA",
  date: "July 20, 2025",
  time: "9:00 AM",
  status: "in-progress",
  customer: "Alice Johnson"
};

export default function JobPhotosPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>("verification");
  const [photos, setPhotos] = useState<PhotoUploadResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUploader, setShowUploader] = useState<boolean>(false);

  // Load existing photos
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would call the API
        // For demo purposes, we'll simulate a delay and return empty arrays
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPhotos([]);
      } catch (error) {
        console.error("Error loading photos:", error);
        toast({
          title: "Error",
          description: "Failed to load existing photos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPhotos();
  }, [id]);

  // Handle photo upload complete
  const handleUploadComplete = (photo: PhotoUploadResult) => {
    setPhotos([...photos, photo]);
    setShowUploader(false);
    
    toast({
      title: "Photo Uploaded",
      description: "Your photo has been uploaded successfully.",
    });
  };

  // Handle verification complete
  const handleVerificationComplete = () => {
    toast({
      title: "Verification Complete",
      description: "Job verification photos have been submitted.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Job Photos | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading={`Photos: ${sampleJob.title}`}
          text="Upload and manage job photos"
          icon={<Camera className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Tabs defaultValue="verification" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="all">All Photos</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="verification" className="space-y-6">
              <BeforeAfterUploader
                jobId={id as string}
                onComplete={handleVerificationComplete}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>About Photo Verification</CardTitle>
                  <CardDescription>
                    Why we require before and after photos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Photo verification helps ensure quality service and provides documentation of the work performed.
                      Before and after photos allow customers to see the difference made by our cleaning service.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Before Photos</h4>
                        <p className="text-sm text-muted-foreground">
                          Take photos of the area before starting work to document the initial condition.
                          Focus on areas that need the most attention.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">After Photos</h4>
                        <p className="text-sm text-muted-foreground">
                          Take photos from the same angles after completing work to show the improvements made.
                          Ensure the area is completely cleaned and organized.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Job Photos</CardTitle>
                  <CardDescription>
                    View all photos for this job
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                  ) : photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.url}
                            alt={photo.caption || "Job photo"}
                            className="w-full h-auto rounded-md aspect-square object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {photo.category}
                          </div>
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs truncate">
                              {photo.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Photos Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        No photos have been uploaded for this job yet.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("upload")}
                      >
                        Upload Photos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upload">
              <PhotoUploader
                jobId={id as string}
                onUploadComplete={handleUploadComplete}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardShell>
    </>
  );
}