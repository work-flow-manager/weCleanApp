"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Shield, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LocationPrivacySettings {
  trackingEnabled: boolean;
  shareAccuracy: boolean;
  trackOnlyDuringShift: boolean;
}

export default function LocationPrivacySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<LocationPrivacySettings>({
    trackingEnabled: false,
    shareAccuracy: true,
    trackOnlyDuringShift: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/team-locations/privacy");
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        } else {
          console.error("Failed to load privacy settings");
          toast({
            title: "Error",
            description: "Failed to load your location privacy settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading privacy settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  // Handle setting changes
  const handleSettingChange = (setting: keyof LocationPrivacySettings, value: boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: value };
      
      // If tracking is disabled, we don't need to show a warning about the other settings
      setHasChanges(true);
      return newSettings;
    });
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch("/api/team-locations/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your location privacy settings have been updated.",
        });
        setHasChanges(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast({
        title: "Error",
        description: "Failed to save your location privacy settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-pink-500" />
          Location Privacy Settings
        </CardTitle>
        <CardDescription>
          Control how your location information is shared and used within the platform
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Label htmlFor="tracking-toggle" className="text-base font-medium">
                    Enable Location Tracking
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Allow the app to track your location while you're using it
                  </p>
                </div>
                <Switch
                  id="tracking-toggle"
                  checked={settings.trackingEnabled}
                  onCheckedChange={(checked) => handleSettingChange('trackingEnabled', checked)}
                />
              </div>

              <div className="flex items-start justify-between opacity-75">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-pink-500" />
                  <div>
                    <Label htmlFor="accuracy-toggle" className="text-base font-medium">
                      Share Location Accuracy
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share precise location data (within a few meters)
                    </p>
                  </div>
                </div>
                <Switch
                  id="accuracy-toggle"
                  checked={settings.shareAccuracy}
                  onCheckedChange={(checked) => handleSettingChange('shareAccuracy', checked)}
                  disabled={!settings.trackingEnabled}
                />
              </div>

              <div className="flex items-start justify-between opacity-75">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-pink-500" />
                  <div>
                    <Label htmlFor="shift-toggle" className="text-base font-medium">
                      Track Only During Shifts
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only track location during your scheduled work hours
                    </p>
                  </div>
                </div>
                <Switch
                  id="shift-toggle"
                  checked={settings.trackOnlyDuringShift}
                  onCheckedChange={(checked) => handleSettingChange('trackOnlyDuringShift', checked)}
                  disabled={!settings.trackingEnabled}
                />
              </div>
            </div>

            <div className="bg-pink-50 p-4 rounded-md border border-pink-100 mt-4">
              <h4 className="text-sm font-medium text-pink-800 mb-1">About Location Data</h4>
              <p className="text-xs text-pink-700">
                Your location data is only visible to your managers and administrators. 
                It's used to optimize job assignments and provide accurate ETAs to customers.
                Historical location data is automatically deleted after 30 days.
              </p>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isLoading || isSaving || !hasChanges}
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}