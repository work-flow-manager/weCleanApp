"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Paintbrush, 
  RefreshCw, 
  Check, 
  Palette, 
  Save, 
  Trash2, 
  Download,
  Upload
} from "lucide-react";
import { useTheme, ThemeSettings } from "@/contexts/ThemeContext";
import { generateThemeColors, generateColorPalette } from "@/lib/utils/colorUtils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface ThemeCustomizerProps {
  className?: string;
}

export default function ThemeCustomizer({ className = "" }: ThemeCustomizerProps) {
  const { user } = useAuth();
  const { 
    theme, 
    savedThemes, 
    updateTheme, 
    updateColors, 
    resetTheme, 
    saveTheme, 
    loadTheme, 
    deleteTheme,
    isLoading 
  } = useTheme();
  
  const [activeTab, setActiveTab] = useState<string>("colors");
  const [primaryColor, setPrimaryColor] = useState<string>(theme.colors.primary);
  const [previewTheme, setPreviewTheme] = useState<ThemeSettings>(theme);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [colorPalette, setColorPalette] = useState<{ [key: string]: string }>({});
  const [themeName, setThemeName] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);

  // Update preview theme when primary color changes
  useEffect(() => {
    if (primaryColor !== theme.colors.primary) {
      const newColors = generateThemeColors(primaryColor);
      setPreviewTheme({
        ...previewTheme,
        colors: newColors,
      });
      
      // Generate color palette
      const palette = generateColorPalette(primaryColor);
      setColorPalette(palette);
    }
  }, [primaryColor]);

  // Reset preview theme when actual theme changes
  useEffect(() => {
    setPreviewTheme(theme);
    setPrimaryColor(theme.colors.primary);
    
    // Generate color palette
    const palette = generateColorPalette(theme.colors.primary);
    setColorPalette(palette);
  }, [theme]);

  // Apply theme changes
  const applyTheme = () => {
    setIsApplying(true);
    
    try {
      // Update colors
      updateColors(previewTheme.colors);
      
      // Update other theme settings
      updateTheme({
        borderRadius: previewTheme.borderRadius,
        glassmorphism: previewTheme.glassmorphism,
        darkMode: previewTheme.darkMode,
      });
      
      toast({
        title: "Theme Updated",
        description: "Your theme changes have been applied.",
      });
    } catch (error) {
      console.error("Error applying theme:", error);
      toast({
        title: "Error",
        description: "Failed to apply theme changes.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Reset theme to default
  const handleResetTheme = () => {
    resetTheme();
    
    toast({
      title: "Theme Reset",
      description: "Your theme has been reset to default.",
    });
  };

  // Update preview theme
  const updatePreviewTheme = (updates: Partial<ThemeSettings>) => {
    setPreviewTheme(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Update preview colors
  const updatePreviewColors = (updates: Partial<typeof theme.colors>) => {
    setPreviewTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...updates,
      },
    }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-pink-500" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Customize the appearance of your application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="colors" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-8 p-0 overflow-hidden"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mt-2">
                {["#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"].map((color) => (
                  <button
                    key={color}
                    className={`w-full h-8 rounded-md transition-all ${
                      primaryColor === color ? "ring-2 ring-offset-2 ring-pink-500" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setPrimaryColor(color)}
                    aria-label={`Select color ${color}`}
                  ></button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Theme Preview</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPalette(!showPalette)}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  {showPalette ? "Hide Palette" : "Show Palette"}
                </Button>
              </div>
              
              <div className="p-4 rounded-md border" style={{ backgroundColor: previewTheme.colors.background }}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <div
                      className="h-12 px-4 rounded-md flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: previewTheme.colors.primary,
                        color: previewTheme.colors.primary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                      }}
                    >
                      Primary
                    </div>
                    <div
                      className="h-12 px-4 rounded-md flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: previewTheme.colors.secondary,
                        color: previewTheme.colors.secondary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                      }}
                    >
                      Secondary
                    </div>
                    <div
                      className="h-12 px-4 rounded-md flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: previewTheme.colors.accent,
                        color: previewTheme.colors.accent === "#FFFFFF" ? "#000000" : "#FFFFFF",
                      }}
                    >
                      Accent
                    </div>
                  </div>
                  
                  <div
                    className="p-4 rounded-md border space-y-2"
                    style={{
                      backgroundColor: previewTheme.glassmorphism
                        ? `${previewTheme.colors.primary}10`
                        : "#FFFFFF",
                      borderColor: previewTheme.glassmorphism
                        ? `${previewTheme.colors.primary}20`
                        : "#E5E7EB",
                      backdropFilter: previewTheme.glassmorphism ? "blur(8px)" : "none",
                    }}
                  >
                    <h3
                      className="text-lg font-medium"
                      style={{ color: previewTheme.colors.text }}
                    >
                      Glassmorphism Card
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: previewTheme.colors.muted }}
                    >
                      This is how your cards will look with the selected theme.
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{
                          backgroundColor: previewTheme.colors.primary,
                          color: previewTheme.colors.primary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                        }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-4 py-2 rounded-md text-sm font-medium border"
                        style={{
                          backgroundColor: "transparent",
                          borderColor: previewTheme.colors.primary,
                          color: previewTheme.colors.primary,
                        }}
                      >
                        Outline Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Color palette */}
              {showPalette && (
                <div className="mt-4 space-y-2">
                  <Label>Color Palette</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(colorPalette).map(([shade, color]) => (
                      <div
                        key={shade}
                        className="flex flex-col items-center"
                        onClick={() => setPrimaryColor(color)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className="w-full h-8 rounded-md"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs mt-1">{shade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Advanced color settings */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Advanced Color Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: previewTheme.colors.secondary }}
                      ></div>
                      <Input
                        id="secondary-color"
                        type="color"
                        value={previewTheme.colors.secondary}
                        onChange={(e) => updatePreviewColors({ secondary: e.target.value })}
                        className="w-12 h-8 p-0 overflow-hidden"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: previewTheme.colors.accent }}
                      ></div>
                      <Input
                        id="accent-color"
                        type="color"
                        value={previewTheme.colors.accent}
                        onChange={(e) => updatePreviewColors({ accent: e.target.value })}
                        className="w-12 h-8 p-0 overflow-hidden"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: previewTheme.colors.background }}
                      ></div>
                      <Input
                        id="background-color"
                        type="color"
                        value={previewTheme.colors.background}
                        onChange={(e) => updatePreviewColors({ background: e.target.value })}
                        className="w-12 h-8 p-0 overflow-hidden"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: previewTheme.colors.text }}
                      ></div>
                      <Input
                        id="text-color"
                        type="color"
                        value={previewTheme.colors.text}
                        onChange={(e) => updatePreviewColors({ text: e.target.value })}
                        className="w-12 h-8 p-0 overflow-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <RadioGroup
                  value={previewTheme.borderRadius}
                  onValueChange={(value) => updatePreviewTheme({ borderRadius: value as any })}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="radius-none" />
                    <Label htmlFor="radius-none">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="radius-small" />
                    <Label htmlFor="radius-small">Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="radius-medium" />
                    <Label htmlFor="radius-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="radius-large" />
                    <Label htmlFor="radius-large">Large</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="glassmorphism">Glassmorphism Effect</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable transparent glass-like effect for cards and panels
                  </p>
                </div>
                <Switch
                  id="glassmorphism"
                  checked={previewTheme.glassmorphism}
                  onCheckedChange={(checked) => updatePreviewTheme({ glassmorphism: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the entire application
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={previewTheme.darkMode}
                  onCheckedChange={(checked) => updatePreviewTheme({ darkMode: checked })}
                />
              </div>
              
              <div className="pt-4">
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div
                    className="p-4 rounded-md border"
                    style={{
                      backgroundColor: previewTheme.darkMode ? "#1F2937" : previewTheme.colors.background,
                      borderRadius: 
                        previewTheme.borderRadius === "none" ? "0" :
                        previewTheme.borderRadius === "small" ? "0.25rem" :
                        previewTheme.borderRadius === "large" ? "0.75rem" :
                        "0.5rem",
                    }}
                  >
                    <div
                      className="p-4 rounded-md border space-y-2"
                      style={{
                        backgroundColor: previewTheme.glassmorphism
                          ? previewTheme.darkMode
                            ? "rgba(31, 41, 55, 0.7)"
                            : `${previewTheme.colors.primary}10`
                          : previewTheme.darkMode
                            ? "#374151"
                            : "#FFFFFF",
                        borderColor: previewTheme.glassmorphism
                          ? previewTheme.darkMode
                            ? "rgba(55, 65, 81, 0.5)"
                            : `${previewTheme.colors.primary}20`
                          : previewTheme.darkMode
                            ? "#4B5563"
                            : "#E5E7EB",
                        backdropFilter: previewTheme.glassmorphism ? "blur(8px)" : "none",
                        borderRadius: 
                          previewTheme.borderRadius === "none" ? "0" :
                          previewTheme.borderRadius === "small" ? "0.25rem" :
                          previewTheme.borderRadius === "large" ? "0.75rem" :
                          "0.5rem",
                      }}
                    >
                      <h3
                        className="text-lg font-medium"
                        style={{ color: previewTheme.darkMode ? "#FFFFFF" : previewTheme.colors.text }}
                      >
                        Appearance Preview
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: previewTheme.darkMode ? "#9CA3AF" : previewTheme.colors.muted }}
                      >
                        This is how your application will look with the selected appearance settings.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          className="px-4 py-2 text-sm font-medium"
                          style={{
                            backgroundColor: previewTheme.colors.primary,
                            color: previewTheme.colors.primary === "#FFFFFF" ? "#000000" : "#FFFFFF",
                            borderRadius: 
                              previewTheme.borderRadius === "none" ? "0" :
                              previewTheme.borderRadius === "small" ? "0.25rem" :
                              previewTheme.borderRadius === "large" ? "0.75rem" :
                              "0.5rem",
                          }}
                        >
                          Primary Button
                        </button>
                        <button
                          className="px-4 py-2 text-sm font-medium border"
                          style={{
                            backgroundColor: "transparent",
                            borderColor: previewTheme.colors.primary,
                            color: previewTheme.darkMode ? "#FFFFFF" : previewTheme.colors.primary,
                            borderRadius: 
                              previewTheme.borderRadius === "none" ? "0" :
                              previewTheme.borderRadius === "small" ? "0.25rem" :
                              previewTheme.borderRadius === "large" ? "0.75rem" :
                              "0.5rem",
                          }}
                        >
                          Outline Button
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResetTheme}
            disabled={isApplying || isSaving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Load
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Saved Themes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {savedThemes.length > 0 ? (
                savedThemes.map((savedTheme) => (
                  <DropdownMenuItem 
                    key={savedTheme.id}
                    onClick={() => loadTheme(savedTheme)}
                    className="flex justify-between"
                  >
                    <span>{savedTheme.name}</span>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: savedTheme.colors.primary }}
                      />
                      <Trash2 
                        className="h-4 w-4 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTheme(savedTheme.id as string);
                          toast({
                            title: "Theme Deleted",
                            description: `"${savedTheme.name}" has been deleted.`,
                          });
                        }}
                      />
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No saved themes</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isApplying || isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Theme</DialogTitle>
                <DialogDescription>
                  Save your current theme for future use. Saved themes can be applied to your entire business.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="theme-name" className="mb-2 block">Theme Name</Label>
                <Input
                  id="theme-name"
                  placeholder="My Brand Theme"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!themeName.trim()) {
                      toast({
                        title: "Error",
                        description: "Please enter a theme name.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    setIsSaving(true);
                    try {
                      await saveTheme(themeName);
                      toast({
                        title: "Theme Saved",
                        description: `"${themeName}" has been saved.`,
                      });
                      setThemeName("");
                      setSaveDialogOpen(false);
                    } catch (error) {
                      console.error("Error saving theme:", error);
                      toast({
                        title: "Error",
                        description: "Failed to save theme.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || !themeName.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Theme
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={applyTheme}
            disabled={isApplying || isSaving || JSON.stringify(theme) === JSON.stringify(previewTheme)}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Apply
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}