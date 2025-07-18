"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Download, Upload, FileJson, AlertCircle } from "lucide-react";
import { useTheme, ThemeSettings } from "@/contexts/ThemeContext";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface ThemeExportImportProps {
  className?: string;
}

export default function ThemeExportImport({ className = "" }: ThemeExportImportProps) {
  const { theme, updateTheme, updateColors } = useTheme();
  const [isImporting, setIsImporting] = useState<boolean>(false);
  
  // Export current theme as JSON file
  const handleExportTheme = () => {
    try {
      // Create a JSON blob
      const themeJson = JSON.stringify(theme, null, 2);
      const blob = new Blob([themeJson], { type: "application/json" });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `we-clean-theme-${new Date().toISOString().split("T")[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Theme Exported",
        description: "Your theme has been exported as a JSON file.",
      });
    } catch (error) {
      console.error("Error exporting theme:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export theme.",
        variant: "destructive",
      });
    }
  };
  
  // Import theme from JSON file
  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTheme = JSON.parse(content) as ThemeSettings;
        
        // Validate imported theme
        if (!importedTheme.colors || 
            !importedTheme.colors.primary || 
            !importedTheme.borderRadius) {
          throw new Error("Invalid theme format");
        }
        
        // Apply imported theme
        updateColors(importedTheme.colors);
        updateTheme({
          borderRadius: importedTheme.borderRadius,
          glassmorphism: importedTheme.glassmorphism,
          darkMode: importedTheme.darkMode,
        });
        
        toast({
          title: "Theme Imported",
          description: "The imported theme has been applied.",
        });
      } catch (error) {
        console.error("Error importing theme:", error);
        toast({
          title: "Import Failed",
          description: "Failed to import theme. The file may be invalid or corrupted.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = "";
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Failed to read the file.",
        variant: "destructive",
      });
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    };
    
    reader.readAsText(file);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-pink-500" />
          Theme Export & Import
        </CardTitle>
        <CardDescription>
          Export your current theme or import a theme from a JSON file
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Theme Portability</AlertTitle>
          <AlertDescription>
            Export your theme to share with other businesses or import themes from other sources.
            Imported themes will be applied immediately but not saved until you click "Save Theme".
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Export Theme</h3>
            <p className="text-sm text-muted-foreground">
              Download your current theme as a JSON file that can be shared or imported later.
            </p>
            <Button onClick={handleExportTheme} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Current Theme
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Import Theme</h3>
            <p className="text-sm text-muted-foreground">
              Import a theme from a JSON file. The theme will be applied immediately.
            </p>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="theme-import">Upload Theme File</Label>
              <Input
                id="theme-import"
                type="file"
                accept=".json"
                onChange={handleImportTheme}
                disabled={isImporting}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}