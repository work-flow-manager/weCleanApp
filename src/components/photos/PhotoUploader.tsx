"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Upload, Loader2, X } from "lucide-react";
import PhotoCapture from "./PhotoCapture";
import { uploadPhoto, PhotoCategory, PhotoUploadResult } from "@/lib/services/photoUpload";

interface PhotoUploaderProps {
  jobId: string;
  onUploadComplete?: (photo: PhotoUploadResult) => void;
  onCancel?: () => void;
  defaultCategory?: PhotoCategory;
  className?: string;
}

export default function PhotoUploader({
  jobId,
  onUploadComplete,
  onCancel,
  defaultCategory = "before",
  className = "",
}: PhotoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<PhotoCategory>(defaultCategory);
  const [caption, setCaption] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    handleFileSelected(file);
  };

  // Handle file selected (from input or camera)
  const handleFileSelected = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Please select an image smaller than 10MB.");
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture
  const handleCapture = (file: File) => {
    handleFileSelected(file);
    setShowCamera(false);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await uploadPhoto(selectedFile, {
        jobId,
        category,
        caption: caption || undefined
      });
      
      toast({
        title: "Photo Uploaded",
        description: "Your photo has been uploaded successfully.",
      });
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption("");
    } catch (error) {
      console.error("Error uploading photo:", error);
      setError("Failed to upload photo. Please try again.");
      
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>Upload Photo</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* File preview */}
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-md"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white/100"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => setShowCamera(true)}
              >
                <Camera className="h-6 w-6" />
                <span>Take Photo</span>
              </Button>
              
              <Label
                htmlFor="photo-upload"
                className="h-24 flex flex-col items-center justify-center gap-2 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <Upload className="h-6 w-6" />
                <span>Upload Photo</span>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Label>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          
          {/* Photo category */}
          <div className="space-y-2">
            <Label>Photo Type</Label>
            <RadioGroup
              value={category}
              onValueChange={(value) => setCategory(value as PhotoCategory)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="before" id="before" />
                <Label htmlFor="before">Before</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after">After</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="issue" id="issue" />
                <Label htmlFor="issue">Issue</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Textarea
              id="caption"
              placeholder="Add a description for this photo"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Photo"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Camera dialog */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4">
            <DialogTitle>Take a Photo</DialogTitle>
          </DialogHeader>
          <PhotoCapture
            onCapture={handleCapture}
            onCancel={() => setShowCamera(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}