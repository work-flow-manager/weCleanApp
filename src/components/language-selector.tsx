"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { locales, localeNames, localeFlags, localeDirections } from "@/i18n/settings";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";

export default function LanguageSelector() {
  const t = useTranslations("settings");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [isPending, startTransition] = useTransition();
  const [isChanging, setIsChanging] = useState(false);

  // Function to change language
  const changeLanguage = async (newLocale: string) => {
    if (newLocale === locale) return;
    
    setIsChanging(true);
    
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
      const pathWithoutLocale = pathname.replace(`/${locale}`, '');
      
      // Navigate to the same page with the new locale
      startTransition(() => {
        router.replace(`/${newLocale}${pathWithoutLocale || ''}`);
      });
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2"
          disabled={isPending || isChanging}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-block">{localeNames[locale as keyof typeof localeNames]}</span>
          <span className="inline-block md:hidden">{localeFlags[locale as keyof typeof localeFlags]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => changeLanguage(l)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>{localeFlags[l]}</span>
              <span>{localeNames[l]}</span>
            </div>
            {l === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}