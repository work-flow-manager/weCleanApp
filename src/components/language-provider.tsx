"use client";

import React, { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { localeDirections, Locale } from "@/i18n/settings";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/contexts/AuthContext";

interface LanguageProviderProps {
  children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const locale = useLocale() as Locale;
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [isLoaded, setIsLoaded] = useState(false);

  // Set the direction attribute based on the locale
  useEffect(() => {
    const dir = localeDirections[locale] || 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    
    // Add RTL-specific styles if needed
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
    
    // Save language preference
    localStorage.setItem("we-clean-language", locale);
    
    // If user is authenticated, save to database
    if (user?.id) {
      const saveLanguagePreference = async () => {
        try {
          await supabase
            .from('user_settings')
            .upsert({
              user_id: user.id,
              language: locale,
              updated_at: new Date().toISOString()
            });
            
          // Also update the profiles table
          await supabase
            .from('profiles')
            .update({ language: locale })
            .eq('id', user.id);
        } catch (error) {
          console.error("Error saving language preference:", error);
        }
      };
      
      saveLanguagePreference();
    }
    
    setIsLoaded(true);
  }, [locale, user?.id]);

  // Add RTL support styles
  useEffect(() => {
    // Add global RTL styles
    const style = document.createElement('style');
    style.id = 'rtl-styles';
    style.innerHTML = `
      html.rtl {
        direction: rtl;
      }
      
      html.rtl .rtl-mirror {
        transform: scaleX(-1);
      }
      
      html.rtl .rtl-swap-margins {
        margin-right: var(--margin-left, 0);
        margin-left: var(--margin-right, 0);
      }
      
      html.rtl .rtl-swap-paddings {
        padding-right: var(--padding-left, 0);
        padding-left: var(--padding-right, 0);
      }
      
      html.rtl .rtl-text-right {
        text-align: left;
      }
      
      html.rtl .rtl-text-left {
        text-align: right;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('rtl-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  if (!isLoaded) {
    return null;
  }

  return <>{children}</>;
}