"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Calendar, Check, Home, Settings, User } from "lucide-react";
import { ThemeSettings } from "@/contexts/ThemeContext";

interface ThemePreviewProps {
  theme: ThemeSettings;
  className?: string;
}

export default function ThemePreview({ theme, className = "" }: ThemePreviewProps) {
  // Apply theme styles to preview
  const previewStyle = {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-accent": theme.colors.accent,
    "--color-background": theme.colors.background,
    "--color-text": theme.colors.text,
    "--color-muted": theme.colors.muted,
    "--border-radius": 
      theme.borderRadius === "none" ? "0" :
      theme.borderRadius === "small" ? "0.25rem" :
      theme.borderRadius === "large" ? "0.75rem" :
      "0.5rem",
    "--glass-background": theme.glassmorphism ? `${theme.colors.primary}10` : "transparent",
    "--glass-border": theme.glassmorphism ? `${theme.colors.primary}20` : "transparent",
    "--glass-blur": theme.glassmorphism ? "8px" : "0px",
  } as React.CSSProperties;

  return (
    <div 
      className={`theme-preview ${className}`} 
      style={{ 
        ...previewStyle,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: theme.colors.primary }}
            >
              W
            </div>
            <span className="text-lg font-bold">We-Clean.app</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              style={{ color: theme.colors.muted }}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback
                style={{ 
                  backgroundColor: theme.colors.secondary,
                  color: theme.colors.secondary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                }}
              >
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="w-48 space-y-1">
            <div 
              className="p-2 rounded-md flex items-center gap-2"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.primary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                borderRadius: 
                  theme.borderRadius === "none" ? "0" :
                  theme.borderRadius === "small" ? "0.25rem" :
                  theme.borderRadius === "large" ? "0.75rem" :
                  "0.5rem",
              }}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
            
            <div 
              className="p-2 rounded-md flex items-center gap-2"
              style={{ color: theme.colors.muted }}
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </div>
            
            <div 
              className="p-2 rounded-md flex items-center gap-2"
              style={{ color: theme.colors.muted }}
            >
              <User className="h-4 w-4" />
              <span>Team</span>
            </div>
            
            <div 
              className="p-2 rounded-md flex items-center gap-2"
              style={{ color: theme.colors.muted }}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <Card
              style={{
                backgroundColor: theme.glassmorphism ? `${theme.colors.primary}10` : "#FFFFFF",
                borderColor: theme.glassmorphism ? `${theme.colors.primary}20` : "#E5E7EB",
                backdropFilter: theme.glassmorphism ? "blur(8px)" : "none",
                borderRadius: 
                  theme.borderRadius === "none" ? "0" :
                  theme.borderRadius === "small" ? "0.25rem" :
                  theme.borderRadius === "large" ? "0.75rem" :
                  "0.5rem",
              }}
            >
              <CardHeader>
                <CardTitle style={{ color: theme.colors.text }}>Welcome Back</CardTitle>
                <CardDescription style={{ color: theme.colors.muted }}>
                  Here's an overview of your cleaning business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className="p-4 rounded-md border"
                    style={{
                      borderColor: theme.glassmorphism ? `${theme.colors.primary}20` : "#E5E7EB",
                      borderRadius: 
                        theme.borderRadius === "none" ? "0" :
                        theme.borderRadius === "small" ? "0.25rem" :
                        theme.borderRadius === "large" ? "0.75rem" :
                        "0.5rem",
                    }}
                  >
                    <div className="text-sm" style={{ color: theme.colors.muted }}>Jobs Today</div>
                    <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>12</div>
                  </div>
                  
                  <div 
                    className="p-4 rounded-md border"
                    style={{
                      borderColor: theme.glassmorphism ? `${theme.colors.primary}20` : "#E5E7EB",
                      borderRadius: 
                        theme.borderRadius === "none" ? "0" :
                        theme.borderRadius === "small" ? "0.25rem" :
                        theme.borderRadius === "large" ? "0.75rem" :
                        "0.5rem",
                    }}
                  >
                    <div className="text-sm" style={{ color: theme.colors.muted }}>Team Members</div>
                    <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>8</div>
                  </div>
                  
                  <div 
                    className="p-4 rounded-md border"
                    style={{
                      borderColor: theme.glassmorphism ? `${theme.colors.primary}20` : "#E5E7EB",
                      borderRadius: 
                        theme.borderRadius === "none" ? "0" :
                        theme.borderRadius === "small" ? "0.25rem" :
                        theme.borderRadius === "large" ? "0.75rem" :
                        "0.5rem",
                    }}
                  >
                    <div className="text-sm" style={{ color: theme.colors.muted }}>Completed</div>
                    <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>5</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.primary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                    borderRadius: 
                      theme.borderRadius === "none" ? "0" :
                      theme.borderRadius === "small" ? "0.25rem" :
                      theme.borderRadius === "large" ? "0.75rem" :
                      "0.5rem",
                  }}
                >
                  View All Jobs
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
              <Card
                style={{
                  backgroundColor: theme.glassmorphism ? `${theme.colors.primary}10` : "#FFFFFF",
                  borderColor: theme.glassmorphism ? `${theme.colors.primary}20` : "#E5E7EB",
                  backdropFilter: theme.glassmorphism ? "blur(8px)" : "none",
                  borderRadius: 
                    theme.borderRadius === "none" ? "0" :
                    theme.borderRadius === "small" ? "0.25rem" :
                    theme.borderRadius === "large" ? "0.75rem" :
                    "0.5rem",
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: theme.colors.text }}>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      style={{
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.primary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                        borderRadius: 
                          theme.borderRadius === "none" ? "0" :
                          theme.borderRadius === "small" ? "0.25rem" :
                          theme.borderRadius === "large" ? "0.75rem" :
                          "0.5rem",
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Job
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      style={{
                        borderColor: theme.colors.primary,
                        color: theme.colors.primary,
                        borderRadius: 
                          theme.borderRadius === "none" ? "0" :
                          theme.borderRadius === "small" ? "0.25rem" :
                          theme.borderRadius === "large" ? "0.75rem" :
                          "0.5rem",
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card
                style={{
                  backgroundColor: theme.glassmorphism ? `${theme.colors.primary}10` : "#FFFFFF",
                  borderColor: theme.glassmorphism ? `${theme.colors.primary}20` : "#E5E7EB",
                  backdropFilter: theme.glassmorphism ? "blur(8px)" : "none",
                  borderRadius: 
                    theme.borderRadius === "none" ? "0" :
                    theme.borderRadius === "small" ? "0.25rem" :
                    theme.borderRadius === "large" ? "0.75rem" :
                    "0.5rem",
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: theme.colors.text }}>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check 
                        className="h-4 w-4"
                        style={{ color: theme.colors.accent }}
                      />
                      <span style={{ color: theme.colors.text }}>Job #1234 completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check 
                        className="h-4 w-4"
                        style={{ color: theme.colors.accent }}
                      />
                      <span style={{ color: theme.colors.text }}>New customer added</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}