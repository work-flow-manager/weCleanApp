"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Account Settings | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="Account Settings"
          text="Manage your account preferences and personal information"
          icon={<User className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings content will be implemented in a future task.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </>
  );
}