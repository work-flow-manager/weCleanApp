"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Moon, Sun, Laptop } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { updateUserSettings, getUserSettings, UserSettings } from "@/lib/supabase";

interface UserSettingsFormProps {
  userId: string;
}

export function UserSettingsForm({ userId }: UserSettingsFormProps) {
  const { updateProfile } = useAuth();
  
  const [settings, setSettings] = useState({
    theme: "system",
    language: "en",
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;
      
      try {
        const userSettings = await getUserSettings(userId);
        
        if (userSettings) {
          setSettings({
            theme: userSettings.theme,
            language: userSettings.language,
            email_notifications: userSettings.email_notifications,
            push_notifications: userSettings.push_notifications,
            sms_notifications: userSettings.sms_notifications,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error loading settings",
          description: "Your settings could not be loaded. Default values are shown.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [userId]);
  
  const handleSaveSettings = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    
    try {
      // Update user settings
      await updateUserSettings(userId, {
        theme: settings.theme as UserSettings["theme"],
        language: settings.language,
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        sms_notifications: settings.sms_notifications,
      });
      
      // Update profile language
      await updateProfile({
        language: settings.language,
      });
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "Your settings could not be saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose how the application looks
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Button
            type="button"
            variant={settings.theme === "light" ? "default" : "outline"}
            className="flex flex-col items-center justify-center gap-2 h-24"
            onClick={() => setSettings((prev) => ({ ...prev, theme: "light" }))}
          >
            <Sun className="h-6 w-6" />
            <span>Light</span>
          </Button>
          
          <Button
            type="button"
            variant={settings.theme === "dark" ? "default" : "outline"}
            className="flex flex-col items-center justify-center gap-2 h-24"
            onClick={() => setSettings((prev) => ({ ...prev, theme: "dark" }))}
          >
            <Moon className="h-6 w-6" />
            <span>Dark</span>
          </Button>
          
          <Button
            type="button"
            variant={settings.theme === "system" ? "default" : "outline"}
            className="flex flex-col items-center justify-center gap-2 h-24"
            onClick={() => setSettings((prev) => ({ ...prev, theme: "system" }))}
          >
            <Laptop className="h-6 w-6" />
            <span>System</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Language</h3>
          <p className="text-sm text-muted-foreground">
            Select your preferred language
          </p>
        </div>
        
        <Select
          value={settings.language}
          onValueChange={(value) => setSettings((prev) => ({ ...prev, language: value }))}
        >
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Configure how you receive notifications
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col gap-1">
              <span>Email Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications via email
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={settings.email_notifications}
              onCheckedChange={(checked) => 
                setSettings((prev) => ({ ...prev, email_notifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex flex-col gap-1">
              <span>Push Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications in your browser
              </span>
            </Label>
            <Switch
              id="push-notifications"
              checked={settings.push_notifications}
              onCheckedChange={(checked) => 
                setSettings((prev) => ({ ...prev, push_notifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications" className="flex flex-col gap-1">
              <span>SMS Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive important notifications via SMS
              </span>
            </Label>
            <Switch
              id="sms-notifications"
              checked={settings.sms_notifications}
              onCheckedChange={(checked) => 
                setSettings((prev) => ({ ...prev, sms_notifications: checked }))
              }
            />
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleSaveSettings}
        disabled={isSaving}
        className="w-full md:w-auto"
      >
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </div>
  );
}