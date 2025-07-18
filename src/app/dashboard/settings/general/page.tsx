"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <>
      <Helmet>
        <title>General Settings | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="General Settings"
          text="Manage general application settings"
          icon={<Settings className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>General settings content will be implemented in a future task.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </>
  );
}