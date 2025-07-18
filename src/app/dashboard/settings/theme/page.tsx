"use client";

import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeCustomizer, ThemePreview, ThemeExportImport } from "@/components/settings";
import { Paintbrush, Info, Palette, FileJson } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeSettingsPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("customize");

  return (
    <>
      <Helmet>
        <title>Theme Settings | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading="Theme Settings"
          text="Customize the appearance of your application"
          icon={<Paintbrush className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>White-Label Customization</AlertTitle>
            <AlertDescription>
              Customize the appearance of your application to match your brand identity.
              Changes will be applied to all users in your organization.
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="customize" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customize" className="space-y-6">
              <ThemeCustomizer />
              
              <ThemeExportImport />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-pink-500" />
                    Theme Customization Guide
                  </CardTitle>
                  <CardDescription>
                    Tips for creating an effective brand identity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Customizing your application's theme helps create a consistent brand identity.
                      Follow these guidelines for the best results:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Color Selection</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose colors that reflect your brand identity. The primary color should be
                          your main brand color, while the accent color should complement it.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Glassmorphism Effect</h4>
                        <p className="text-sm text-muted-foreground">
                          The glassmorphism effect adds a modern, translucent look to cards and panels.
                          It works best with lighter background colors.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Border Radius</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose a border radius that matches your brand style. Rounded corners (medium or large)
                          create a friendly, approachable feel, while sharp corners (none or small) create a
                          more professional, serious look.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Contrast and Accessibility</h4>
                        <p className="text-sm text-muted-foreground">
                          Ensure there is sufficient contrast between text and background colors for
                          readability. The system automatically selects contrasting text colors for buttons.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Preview</CardTitle>
                  <CardDescription>
                    Preview how your application will look with the current theme settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  <ThemePreview theme={theme} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardShell>
    </>
  );
}