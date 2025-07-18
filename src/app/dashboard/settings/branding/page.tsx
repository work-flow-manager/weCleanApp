"use client";

import React from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrandingCustomizer } from "@/components/settings";
import { Building, Info, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function BrandingSettingsPage() {
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === "admin";

  return (
    <>
      <Helmet>
        <title>Branding Settings | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="Branding Settings"
          text="Customize your business branding and appearance"
          icon={<Building className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>White-Label Branding</AlertTitle>
            <AlertDescription>
              Customize your business branding to create a consistent identity across the platform.
              Changes will be applied to all users in your organization.
            </AlertDescription>
          </Alert>
          
          {!isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Admin Access Required</CardTitle>
                <CardDescription>
                  You need administrator privileges to customize branding settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Please contact your organization administrator to make changes to branding settings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <BrandingCustomizer />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-pink-500" />
                    Branding Best Practices
                  </CardTitle>
                  <CardDescription>
                    Tips for creating effective business branding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Consistent branding helps build recognition and trust with your customers.
                      Follow these guidelines for the best results:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Logo Design</h4>
                        <p className="text-sm text-muted-foreground">
                          Use a high-quality logo with transparent background when possible.
                          Ensure your logo is legible even at smaller sizes.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Business Name</h4>
                        <p className="text-sm text-muted-foreground">
                          Keep your business name consistent across all platforms and communications.
                          This helps with brand recognition and customer trust.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Custom Domain</h4>
                        <p className="text-sm text-muted-foreground">
                          Using a custom domain that matches your business website creates a seamless
                          experience for your customers and enhances your professional image.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Email Templates</h4>
                        <p className="text-sm text-muted-foreground">
                          Personalize your email communications with consistent messaging that reflects
                          your brand voice. Keep templates professional and concise.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardShell>
    </>
  );
}