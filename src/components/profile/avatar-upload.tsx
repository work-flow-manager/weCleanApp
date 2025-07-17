"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface AvatarUploadProps {
  userId: string;
  avatarUrl?: string | null;
  name: string;
  onAvatarChange: (url: string) => void;
}

export function AvatarUpload({ userId, avatarUrl, name, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const uploadAvatar = async () => {
    if (!file || !userId) return;
    
    setIsUploading(true);
    
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);
        
      // Call the callback with the new URL
      onAvatarChange(urlData.publicUrl);
      
      // Clear the preview and file
      setPreview(null);
      setFile(null);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const cancelUpload = () => {
    setPreview(null);
    setFile(null);
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={preview || avatarUrl || ""} 
            alt={name} 
          />
          <AvatarFallback className="text-2xl">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 p-1 bg-pink-500 rounded-full text-white cursor-pointer hover:bg-pink-600 transition-colors"
        >
          <Camera className="h-4 w-4" />
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      {preview && (
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            size="sm"
            onClick={uploadAvatar}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : null}
            Save
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={cancelUpload}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>
      )}
    </div>
  );
}