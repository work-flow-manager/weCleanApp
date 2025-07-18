"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/contexts/AuthContext";
import { generateThemeColors } from "@/lib/utils/colorUtils";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  borderRadius: "none" | "small" | "medium" | "large" | "full";
  glassmorphism: boolean;
  darkMode: boolean;
  name?: string; // Optional theme name for saved themes
}

export interface ThemeContextType {
  theme: ThemeSettings;
  savedThemes: ThemeSettings[];
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
  saveTheme: (name: string) => Promise<void>;
  loadTheme: (themeOrId: ThemeSettings | string) => void;
  deleteTheme: (themeId: string) => Promise<void>;
  isLoading: boolean;
}

// Default theme with pink glassmorphism
const defaultTheme: ThemeSettings = {
  colors: {
    primary: "#EC4899", // pink-500
    secondary: "#F472B6", // pink-400
    accent: "#FBBF24", // amber-400
    background: "#FDF2F8", // pink-50
    text: "#1F2937", // gray-800
    muted: "#6B7280", // gray-500
  },
  borderRadius: "medium",
  glassmorphism: true,
  darkMode: false,
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  // State
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [savedThemes, setSavedThemes] = useState<ThemeSettings[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage and Supabase on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // First try to load from localStorage for immediate display
        const localTheme = localStorage.getItem("we-clean-theme");
        if (localTheme) {
          setTheme(JSON.parse(localTheme));
        }
        
        // Then try to load from Supabase if user is authenticated
        if (user?.id) {
          // Get user settings from Supabase
          const { data: userSettings } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (userSettings?.theme_settings) {
            // If user has theme settings in Supabase, use those
            const dbTheme = JSON.parse(userSettings.theme_settings);
            setTheme(dbTheme);
            localStorage.setItem("we-clean-theme", JSON.stringify(dbTheme));
          } else if (localTheme) {
            // If user has no theme settings in Supabase but has local settings,
            // save local settings to Supabase
            await supabase
              .from('user_settings')
              .upsert({
                user_id: user.id,
                theme_settings: localTheme
              });
          }
          
          // Load saved themes
          await loadSavedThemes();
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user?.id]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("we-clean-theme", JSON.stringify(theme));
      
      // Apply theme to CSS variables
      applyThemeToDOM(theme);
      
      // Save to Supabase if user is authenticated
      if (user?.id) {
        const saveThemeToSupabase = async () => {
          try {
            await supabase
              .from('user_settings')
              .upsert({
                user_id: user.id,
                theme_settings: JSON.stringify(theme),
                updated_at: new Date().toISOString()
              });
          } catch (error) {
            console.error("Error saving theme to Supabase:", error);
          }
        };
        
        saveThemeToSupabase();
      }
    }
  }, [theme, isInitialized, user?.id]);

  // Load saved themes from Supabase
  const loadSavedThemes = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('business_themes')
        .select('*')
        .eq('business_id', user.business_id || user.id);
        
      if (data) {
        setSavedThemes(data.map(item => ({
          ...JSON.parse(item.theme_settings),
          id: item.id,
          name: item.name
        })));
      }
    } catch (error) {
      console.error("Error loading saved themes:", error);
    }
  };

  // Apply theme to DOM via CSS variables
  const applyThemeToDOM = (theme: ThemeSettings) => {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty("--color-primary-foreground", getContrastColor(theme.colors.primary));
    
    root.style.setProperty("--color-secondary", theme.colors.secondary);
    root.style.setProperty("--color-secondary-foreground", getContrastColor(theme.colors.secondary));
    
    root.style.setProperty("--color-accent", theme.colors.accent);
    root.style.setProperty("--color-accent-foreground", getContrastColor(theme.colors.accent));
    
    root.style.setProperty("--color-background", theme.colors.background);
    root.style.setProperty("--color-foreground", theme.colors.text);
    
    root.style.setProperty("--color-muted", theme.colors.muted);
    
    // Apply border radius
    let borderRadiusValue = "0.5rem"; // medium (default)
    switch (theme.borderRadius) {
      case "none":
        borderRadiusValue = "0";
        break;
      case "small":
        borderRadiusValue = "0.25rem";
        break;
      case "large":
        borderRadiusValue = "0.75rem";
        break;
      case "full":
        borderRadiusValue = "9999px";
        break;
    }
    root.style.setProperty("--border-radius", borderRadiusValue);
    
    // Apply glassmorphism
    if (theme.glassmorphism) {
      const primaryRgb = hexToRgb(theme.colors.primary);
      if (primaryRgb) {
        root.style.setProperty(
          "--glass-background", 
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`
        );
        root.style.setProperty(
          "--glass-border", 
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`
        );
        root.style.setProperty("--glass-blur", "8px");
      }
    } else {
      root.style.setProperty("--glass-background", "transparent");
      root.style.setProperty("--glass-border", "transparent");
      root.style.setProperty("--glass-blur", "0px");
    }
    
    // Apply dark mode
    if (theme.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Update theme
  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme,
    }));
  };

  // Update colors
  const updateColors = (newColors: Partial<ThemeColors>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      colors: {
        ...prevTheme.colors,
        ...newColors,
      },
    }));
  };

  // Reset theme to default
  const resetTheme = () => {
    setTheme(defaultTheme);
  };
  
  // Save current theme with a name
  const saveTheme = async (name: string) => {
    if (!user?.id) return;
    
    try {
      const businessId = user.business_id || user.id;
      
      const { data, error } = await supabase
        .from('business_themes')
        .insert({
          business_id: businessId,
          name: name,
          theme_settings: JSON.stringify(theme),
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Add the new theme to the saved themes list
        setSavedThemes([...savedThemes, {
          ...theme,
          id: data.id,
          name: name
        }]);
      }
      
      return data;
    } catch (error) {
      console.error("Error saving theme:", error);
      throw error;
    }
  };
  
  // Load a saved theme
  const loadTheme = (themeOrId: ThemeSettings | string) => {
    try {
      if (typeof themeOrId === 'string') {
        // Find theme by ID
        const foundTheme = savedThemes.find(t => t.id === themeOrId);
        if (foundTheme) {
          setTheme(foundTheme);
        } else {
          throw new Error("Theme not found");
        }
      } else {
        // Direct theme object
        setTheme(themeOrId);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
      throw error;
    }
  };
  
  // Delete a saved theme
  const deleteTheme = async (themeId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('business_themes')
        .delete()
        .eq('id', themeId);
        
      if (error) throw error;
      
      // Remove the theme from the saved themes list
      setSavedThemes(savedThemes.filter(t => t.id !== themeId));
    } catch (error) {
      console.error("Error deleting theme:", error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      savedThemes, 
      updateTheme, 
      updateColors, 
      resetTheme,
      saveTheme,
      loadTheme,
      deleteTheme,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to determine if a color is light or dark
function isLightColor(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return true;
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

// Helper function to get contrast color (black or white) based on background
function getContrastColor(hexColor: string): string {
  return isLightColor(hexColor) ? "#000000" : "#FFFFFF";
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Custom hook to use theme
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}