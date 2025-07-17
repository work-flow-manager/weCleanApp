"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bell, Globe, Moon, Sun, Palette } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface UserSettings {
  language: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user, profile, updateProfile, loading } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<UserSettings>({
    language: "en",
    theme: "system",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (data) {
          setSettings({
            language: data.language || "en",
            theme: data.theme || "system",
            notifications: {
              email: data.email_notifications || true,
              push: data.push_notifications || true,
              sms: data.sms_notifications || false,
            },
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, [user]);
  
  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Save to user_settings table
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          language: settings.language,
          theme: settings.theme,
          email_notifications: settings.notifications.email,
          push_notifications: settings.notifications.push,
          sms_notifications: settings.notifications.sms,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      // Update profile language
      await updateProfile({
        language: settings.language,
      });
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>General Preferences</CardTitle>
                <CardDescription>
                  Customize your experience with We-Clean.app
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="language" className="text-base">Language</Label>
                      <p className="text-sm text-muted-foreground">
                        Select your preferred language for the application
                      </p>
                    </div>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => 
                        setSettings((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => 
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser or mobile device
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => 
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications" className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => 
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, sms: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose your preferred theme mode
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={settings.theme === "light" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center gap-2 h-24"
                      onClick={() => setSettings((prev) => ({ ...prev, theme: "light" }))}
                    >
                      <Sun className="h-6 w-6" />
                      <span>Light</span>
                    </Button>
                    
                    <Button
                      variant={settings.theme === "dark" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center gap-2 h-24"
                      onClick={() => setSettings((prev) => ({ ...prev, theme: "dark" }))}
                    >
                      <Moon className="h-6 w-6" />
                      <span>Dark</span>
                    </Button>
                    
                    <Button
                      variant={settings.theme === "system" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center gap-2 h-24"
                      onClick={() => setSettings((prev) => ({ ...prev, theme: "system" }))}
                    >
                      <Palette className="h-6 w-6" />
                      <span>System</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Appearance Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}