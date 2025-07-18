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
import { Camera, Image, Split, Pencil } from "lucide-react";
import { 
  PhotoGallery, 
  BeforeAfterSlider, 
  PhotoAnnotation, 
  PhotoLightbox 
} from "@/components/photos";
import { PhotoUploadResult } from "@/lib/services/photoUpload";

// Sample job data for demonstration
const sampleJob = {
  id: "job123",
  title: "Regular Cleaning - Johnson Residence",
  address: "123 Main St, San Francisco, CA",
  date: "July 20, 2025",
  time: "9:00 AM",
  status: "completed",
  customer: "Alice Johnson"
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

// Sample annotations for demonstration
const sampleAnnotations = [
  {
    id: "anno1",
    x: 30,
    y: 40,
    text: "Stain on countertop"
  },
  {
    id: "anno2",
    x: 70,
    y: 60,
    text: "Sink area"
  }
];

export default function JobPhotosComparisonPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>("gallery");
  const [photos, setPhotos] = useState<PhotoUploadResult[]>(samplePhotos);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [annotations, setAnnotations] = useState(sampleAnnotations);

  // Get before and after photos for comparison
  const beforePhotos = photos.filter(photo => photo.category === "before");
  const afterPhotos = photos.filter(photo => photo.category === "after");

  // Load photos
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [id]);

  // Handle photo delete
  const handleDeletePhoto = async (photoId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update state
    setPhotos(photos.filter(photo => photo.id !== photoId));
    
    return true;
  };

  // Handle photo edit
  const handleEditPhoto = async (photoId: string, updates: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update state
    setPhotos(photos.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    ));
    
    return true;
  };

  // Handle annotation save
  const handleSaveAnnotations = (newAnnotations: any[]) => {
    setAnnotations(newAnnotations);
  };

  // Open lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Photo Comparison | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading={`Photos: ${sampleJob.title}`}
          text="View and compare job photos"
          icon={<Camera className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Tabs defaultValue="gallery" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="comparison">Before & After</TabsTrigger>
              <TabsTrigger value="annotation">Annotations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="space-y-6">
              <PhotoGallery
                photos={photos}
                isLoading={isLoading}
                onDeletePhoto={handleDeletePhoto}
                onEditPhoto={handleEditPhoto}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Photo Documentation</CardTitle>
                  <CardDescription>
                    How to effectively document your work with photos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Good photo documentation helps demonstrate the quality of your work and provides
                      evidence of job completion. Follow these tips for effective photo documentation:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Lighting and Angles</h4>
                        <p className="text-sm text-muted-foreground">
                          Ensure good lighting when taking photos. Use natural light when possible and
                          avoid shadows. Take photos from consistent angles for before and after comparisons.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Comprehensive Coverage</h4>
                        <p className="text-sm text-muted-foreground">
                          Take photos of all areas worked on, not just the most visible ones. Include
                          wide shots of rooms as well as close-ups of specific areas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-6">
              {beforePhotos.length > 0 && afterPhotos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {beforePhotos.map((beforePhoto, index) => {
                    // Find matching after photo (by caption or index)
                    const afterPhoto = afterPhotos.find(
                      p => p.caption?.replace("after", "").trim() === beforePhoto.caption?.replace("before", "").trim()
                    ) || afterPhotos[Math.min(index, afterPhotos.length - 1)];
                    
                    if (!afterPhoto) return null;
                    
                    return (
                      <BeforeAfterSlider
                        key={beforePhoto.id}
                        beforeImage={beforePhoto.url}
                        afterImage={afterPhoto.url}
                        beforeCaption={beforePhoto.caption || "Before"}
                        afterCaption={afterPhoto.caption || "After"}
                      />
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Split className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Comparison Available</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      To create before & after comparisons, you need to upload both before and after photos.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/jobs/${id}/photos`}
                    >
                      Upload Photos
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>About Before & After Comparisons</CardTitle>
                  <CardDescription>
                    How to use the comparison slider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      The before & after comparison slider allows you to easily see the difference between
                      the state of an area before and after cleaning. Drag the slider left and right to
                      reveal more of the before or after image.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Pro Tip</h4>
                      <p className="text-xs text-blue-700">
                        For the best comparison results, take before and after photos from the exact same
                        angle and distance. This makes the transformation more apparent and impressive to customers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="annotation" className="space-y-6">
              {photos.length > 0 ? (
                <PhotoAnnotation
                  imageUrl={photos[0].url}
                  initialAnnotations={annotations}
                  onSave={handleSaveAnnotations}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Pencil className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Photos to Annotate</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Upload photos first to add annotations and highlight specific areas.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/jobs/${id}/photos`}
                    >
                      Upload Photos
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>About Photo Annotations</CardTitle>
                  <CardDescription>
                    How to use annotations effectively
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Photo annotations allow you to highlight specific areas in a photo and add explanatory
                      notes. This is useful for pointing out issues, special attention areas, or notable
                      improvements.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Creating Annotations</h4>
                        <p className="text-sm text-muted-foreground">
                          Click anywhere on the image to add an annotation marker. Then, add descriptive
                          text to explain what the marker is highlighting.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Effective Annotations</h4>
                        <p className="text-sm text-muted-foreground">
                          Be specific and concise in your annotation text. Focus on important details
                          that might not be immediately obvious from the photo alone.
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
      
      {/* Photo lightbox */}
      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}