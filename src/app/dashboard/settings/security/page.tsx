"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function SecuritySettingsPage() {
  return (
    <>
      <Helmet>
        <title>Security Settings | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="Security Settings"
          text="Manage your account security and privacy"
          icon={<Lock className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Security settings content will be implemented in a future task.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </>
  );
}