"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import LocationPrivacySettings from "@/components/settings/LocationPrivacySettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Shield } from "lucide-react";

export default function LocationPrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Location Privacy Settings | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="Location Privacy Settings"
          text="Manage how your location information is shared and used"
          icon={<Shield className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <LocationPrivacySettings />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-pink-500" />
                About Location Tracking
              </CardTitle>
              <CardDescription>
                Understanding how location tracking works in We-Clean.app
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2">How We Use Your Location</h3>
                <p className="text-sm text-muted-foreground">
                  Your location is used to optimize job assignments, provide accurate ETAs to customers,
                  and help managers coordinate team activities. Location data is only visible to your
                  managers and administrators within your company.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium mb-2">Privacy Protection</h3>
                <p className="text-sm text-muted-foreground">
                  We take your privacy seriously. You can control when and how your location is tracked,
                  and you can disable tracking completely at any time. Location data is automatically
                  deleted after 30 days.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium mb-2">Battery Usage</h3>
                <p className="text-sm text-muted-foreground">
                  Location tracking is optimized to minimize battery usage. The app only updates your
                  location when you move a significant distance, and you can set it to only track during
                  your scheduled shifts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </>
  );
}