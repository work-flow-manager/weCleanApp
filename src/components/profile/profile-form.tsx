"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "./avatar-upload";
import { Loader2, User, Mail, Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { UserProfile } from "@/lib/supabase";

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    avatar_url: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone_number: profile.phone_number || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedProfile = await updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        avatar_url: formData.avatar_url,
      });
      
      if (updatedProfile) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        {user && (
          <AvatarUpload
            userId={user.id}
            avatarUrl={formData.avatar_url}
            name={formData.full_name}
            onAvatarChange={handleAvatarChange}
          />
        )}
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="pl-10"
              placeholder="Your full name"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              value={profile.email}
              disabled
              className="pl-10 bg-muted"
              placeholder="Your email address"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number || ""}
              onChange={handleInputChange}
              className="pl-10"
              placeholder="Your phone number"
            />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}