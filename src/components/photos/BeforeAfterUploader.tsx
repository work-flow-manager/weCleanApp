"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Camera, Image, Check, AlertCircle } from "lucide-react";
import PhotoUploader from "./PhotoUploader";
import { getJobPhotos, PhotoUploadResult, PhotoCategory } from "@/lib/services/photoUpload";

interface BeforeAfterUploaderProps {
  jobId: string;
  onComplete?: () => void;
  className?: string;
}

export default function BeforeAfterUploader({
  jobId,
  onComplete,
  className = "",
}: BeforeAfterUploaderProps) {
  const [activeTab, setActiveTab] = useState<string>("before");
  const [beforePhotos, setBeforePhotos] = useState<PhotoUploadResult[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<PhotoUploadResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUploader, setShowUploader] = useState<boolean>(false);

  // Load existing photos
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        
        // Load before photos
        const before = await getJobPhotos(jobId, "before");
        setBeforePhotos(before);
        
        // Load after photos
        const after = await getJobPhotos(jobId, "after");
        setAfterPhotos(after);
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
  }, [jobId]);

  // Handle photo upload complete
  const handleUploadComplete = (photo: PhotoUploadResult) => {
    if (photo.category === "before") {
      setBeforePhotos([...beforePhotos, photo]);
    } else if (photo.category === "after") {
      setAfterPhotos([...afterPhotos, photo]);
    }
    
    setShowUploader(false);
  };

  // Check if both before and after photos are uploaded
  const isComplete = beforePhotos.length > 0 && afterPhotos.length > 0;

  // Handle completion
  const handleComplete = () => {
    if (isComplete && onComplete) {
      onComplete();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Job Verification Photos</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="before" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before" className="relative">
              Before
              {beforePhotos.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="after" className="relative">
              After
              {afterPhotos.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="before" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <>
                {beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {beforePhotos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.caption || "Before photo"}
                          className="w-full h-auto rounded-md aspect-square object-cover"
                        />
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
                    <h3 className="text-lg font-medium mb-2">No Before Photos</h3>
                    <p className="text-muted-foreground mb-4">
                      Take photos of the area before starting work.
                    </p>
                  </div>
                )}
                
                {!showUploader && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setShowUploader(true);
                      setActiveTab("before");
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {beforePhotos.length > 0 ? "Add Another Before Photo" : "Add Before Photo"}
                  </Button>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="after" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <>
                {afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {afterPhotos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.caption || "After photo"}
                          className="w-full h-auto rounded-md aspect-square object-cover"
                        />
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
                    <h3 className="text-lg font-medium mb-2">No After Photos</h3>
                    <p className="text-muted-foreground mb-4">
                      Take photos of the area after completing work.
                    </p>
                  </div>
                )}
                
                {!showUploader && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setShowUploader(true);
                      setActiveTab("after");
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {afterPhotos.length > 0 ? "Add Another After Photo" : "Add After Photo"}
                  </Button>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        
        {showUploader && (
          <div className="mt-4">
            <PhotoUploader
              jobId={jobId}
              defaultCategory={activeTab as PhotoCategory}
              onUploadComplete={handleUploadComplete}
              onCancel={() => setShowUploader(false)}
            />
          </div>
        )}
        
        {/* Completion status */}
        <div className={`p-4 rounded-md ${
          isComplete ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
        }`}>
          <div className="flex items-start gap-3">
            {isComplete ? (
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <h4 className={`font-medium ${isComplete ? "text-green-800" : "text-amber-800"}`}>
                {isComplete ? "Photo Verification Complete" : "Photo Verification Incomplete"}
              </h4>
              <p className={`text-sm ${isComplete ? "text-green-700" : "text-amber-700"}`}>
                {isComplete
                  ? "You have uploaded both before and after photos."
                  : `Please upload ${!beforePhotos.length ? "before" : ""}${!beforePhotos.length && !afterPhotos.length ? " and " : ""}${!afterPhotos.length ? "after" : ""} photos to complete verification.`
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          disabled={!isComplete}
          onClick={handleComplete}
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Verification
        </Button>
      </CardFooter>
    </Card>
  );
}