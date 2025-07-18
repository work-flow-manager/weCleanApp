"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Search, Filter, X, Download, Trash2, Edit, ZoomIn } from "lucide-react";
import { PhotoCategory, PhotoUploadResult } from "@/lib/services/photoUpload";

interface PhotoGalleryProps {
  photos: PhotoUploadResult[];
  isLoading?: boolean;
  onDeletePhoto?: (photoId: string) => Promise<boolean>;
  onEditPhoto?: (photoId: string, updates: { caption?: string; category?: PhotoCategory }) => Promise<boolean>;
  className?: string;
}

export default function PhotoGallery({
  photos,
  isLoading = false,
  onDeletePhoto,
  onEditPhoto,
  className = "",
}: PhotoGalleryProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoUploadResult | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editCaption, setEditCaption] = useState<string>("");
  const [editCategory, setEditCategory] = useState<PhotoCategory>("before");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Filter photos based on active tab and search query
  const filteredPhotos = photos.filter((photo) => {
    // Filter by category
    if (activeTab !== "all" && photo.category !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !photo.caption?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Handle photo click
  const handlePhotoClick = (photo: PhotoUploadResult) => {
    setSelectedPhoto(photo);
    setEditCaption(photo.caption || "");
    setEditCategory(photo.category);
    setLightboxOpen(true);
    setEditMode(false);
  };

  // Handle photo download
  const handleDownload = (photo: PhotoUploadResult) => {
    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `photo_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your photo download has started.",
    });
  };

  // Handle photo delete
  const handleDelete = async (photo: PhotoUploadResult) => {
    if (!onDeletePhoto) return;
    
    if (!window.confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await onDeletePhoto(photo.id);
      
      if (success) {
        toast({
          title: "Photo Deleted",
          description: "The photo has been deleted successfully.",
        });
        
        setLightboxOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the photo. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle photo edit
  const handleEdit = async () => {
    if (!onEditPhoto || !selectedPhoto) return;
    
    setIsProcessing(true);
    
    try {
      const updates: { caption?: string; category?: PhotoCategory } = {};
      
      if (editCaption !== (selectedPhoto.caption || "")) {
        updates.caption = editCaption;
      }
      
      if (editCategory !== selectedPhoto.category) {
        updates.category = editCategory;
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length === 0) {
        setEditMode(false);
        return;
      }
      
      const success = await onEditPhoto(selectedPhoto.id, updates);
      
      if (success) {
        toast({
          title: "Photo Updated",
          description: "The photo details have been updated successfully.",
        });
        
        setEditMode(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update the photo. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Photo Gallery</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search captions..."
                className="w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="before">Before</TabsTrigger>
              <TabsTrigger value="after">After</TabsTrigger>
              <TabsTrigger value="issue">Issues</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Photos Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No photos match your search criteria."
                      : activeTab === "all"
                      ? "No photos have been uploaded yet."
                      : `No ${activeTab} photos have been uploaded yet.`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Lightbox dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="sm:max-w-3xl p-0">
          <DialogHeader className="p-4 flex flex-row items-center justify-between">
            <DialogTitle>
              {editMode ? "Edit Photo" : selectedPhoto?.caption || "Photo Details"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="p-4">
            {selectedPhoto && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <img
                      src={selectedPhoto.url}
                      alt={selectedPhoto.caption || "Job photo"}
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                  
                  <div className="w-full md:w-64 space-y-4">
                    {editMode ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Category</Label>
                          <Select
                            value={editCategory}
                            onValueChange={(value) => setEditCategory(value as PhotoCategory)}
                          >
                            <SelectTrigger id="edit-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="before">Before</SelectItem>
                              <SelectItem value="after">After</SelectItem>
                              <SelectItem value="issue">Issue</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-caption">Caption</Label>
                          <Input
                            id="edit-caption"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            placeholder="Add a caption..."
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setEditMode(false)}
                            disabled={isProcessing}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleEdit}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-sm font-medium">Category</div>
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-800">
                              {selectedPhoto.category}
                            </span>
                          </div>
                        </div>
                        
                        {selectedPhoto.caption && (
                          <div>
                            <div className="text-sm font-medium">Caption</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {selectedPhoto.caption}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-sm font-medium">Uploaded</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {new Date(selectedPhoto.createdAt).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleDownload(selectedPhoto)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          
                          {onEditPhoto && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setEditMode(true)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </Button>
                          )}
                          
                          {onDeletePhoto && (
                            <Button
                              variant="destructive"
                              className="w-full"
                              onClick={() => handleDelete(selectedPhoto)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}