"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface PhotoUploadProps {
  jobId: string;
  onSuccess?: () => void;
}

export function PhotoUpload({ jobId, onSuccess }: PhotoUploadProps) {
  const [photoType, setPhotoType] = useState<"before" | "after" | "issue" | "other">("before");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Get Supabase client
      const supabase = createClient();
      
      // Upload to Supabase Storage
      const fileName = `${jobId}/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("job-photos")
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("job-photos")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Save to database
      const { error: dbError } = await supabase
        .from("job_photos")
        .insert({
          job_id: jobId,
          url: urlData.publicUrl,
          type: photoType,
          caption: caption || undefined,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Success
      toast({
        title: "Photo uploaded",
        description: "The photo has been uploaded successfully",
      });

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
      <CardHeader>
        <CardTitle>Upload Photo</CardTitle>
        <CardDescription>
          Add before/after photos or document issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="photo-type">Photo Type</Label>
          <Select 
            value={photoType} 
            onValueChange={(value) => setPhotoType(value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select photo type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before">Before Cleaning</SelectItem>
              <SelectItem value="after">After Cleaning</SelectItem>
              <SelectItem value="issue">Issue/Problem</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption (Optional)</Label>
          <Input
            id="caption"
            placeholder="Add a description for this photo"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Photo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview ? (
            <div className="relative aspect-video rounded-md overflow-hidden bg-gray-100">
              <img 
                src={preview} 
                alt="Preview" 
                className="object-contain w-full h-full"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={clearSelectedFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 border-dashed border-2 border-pink-200"
                onClick={handleCameraCapture}
              >
                <Camera className="h-6 w-6 text-pink-500" />
                <span>Take Photo</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2 border-dashed border-2 border-pink-200"
                onClick={handleCameraCapture}
              >
                <Upload className="h-6 w-6 text-pink-500" />
                <span>Upload Photo</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Photo
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}