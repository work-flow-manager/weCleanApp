"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/contexts/AuthContext";
import { getLocale, Locale, defaultLocale } from "@/i18n/settings";

export function useLanguage() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  const [detectedLocale, setDetectedLocale] = useState<Locale | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Detect and set language on mount
  useEffect(() => {
    const detectLanguage = async () => {
      try {
        let preferredLocale: Locale | null = null;
        
        // First, check if user has a saved preference in localStorage
        const savedLocale = localStorage.getItem("we-clean-language");
        if (savedLocale) {
          preferredLocale = getLocale(savedLocale);
        }
        
        // If user is authenticated, check for preference in database
        if (user?.id && !preferredLocale) {
          const { data: userSettings } = await supabase
            .from('user_settings')
            .select('language')
            .eq('user_id', user.id)
            .single();
            
          if (userSettings?.language) {
            preferredLocale = getLocale(userSettings.language);
          } else {
            // Check profiles table as fallback
            const { data: profile } = await supabase
              .from('profiles')
              .select('language')
              .eq('id', user.id)
              .single();
              
            if (profile?.language) {
              preferredLocale = getLocale(profile.language);
            }
          }
        }
        
        // If no saved preference, detect from browser
        if (!preferredLocale) {
          const browserLocale = navigator.language.split('-')[0];
          preferredLocale = getLocale(browserLocale);
        }
        
        // Set detected locale
        setDetectedLocale(preferredLocale);
        
        // If detected locale is different from current, redirect
        if (preferredLocale && preferredLocale !== currentLocale) {
          const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
          router.replace(`/${preferredLocale}${pathWithoutLocale || ''}`);
        }
      } catch (error) {
        console.error("Error detecting language:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    detectLanguage();
  }, [user?.id]);

  // Function to change language
  const changeLanguage = async (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    try {
      // Save language preference to localStorage
      localStorage.setItem("we-clean-language", newLocale);
      
      // If user is authenticated, save to database
      if (user?.id) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            language: newLocale,
            updated_at: new Date().toISOString()
          });
          
        // Also update the profiles table
        await supabase
          .from('profiles')
          .update({ language: newLocale })
          .eq('id', user.id);
      }
      
      // Get the path without the locale prefix
      const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
      
      // Navigate to the same page with the new locale
      router.replace(`/${newLocale}${pathWithoutLocale || ''}`);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return {
    currentLocale,
    detectedLocale,
    isLoading,
    changeLanguage,
  };
}