"use client";

import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Globe, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks/useLanguage";
import { locales, localeNames, localeFlags, Locale } from "@/i18n/settings";

export default function LanguageSettingsPage() {
  const t = useTranslations();
  const { currentLocale, changeLanguage } = useLanguage();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale);
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async () => {
    if (selectedLocale === currentLocale) return;
    
    setIsChanging(true);
    try {
      await changeLanguage(selectedLocale);
      toast({
        title: t("common.success"),
        description: t("settings.language") + " " + t("common.updated"),
      });
    } catch (error) {
      console.error("Error changing language:", error);
      toast({
        title: t("common.error"),
        description: t("errors.unknownError"),
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("settings.language")} | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading={t("settings.language")}
          text={t("settings.language") + " " + t("settings.title").toLowerCase()}
          icon={<Globe className="h-6 w-6 text-pink-500" />}
        />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.language")}</CardTitle>
              <CardDescription>
                {t("settings.language") + " " + t("settings.title").toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedLocale}
                onValueChange={(value) => setSelectedLocale(value as Locale)}
                className="space-y-4"
              >
                {locales.map((locale) => (
                  <div key={locale} className="flex items-center space-x-2">
                    <RadioGroupItem value={locale} id={`language-${locale}`} />
                    <Label htmlFor={`language-${locale}`} className="flex items-center gap-2">
                      <span className="text-lg">{localeFlags[locale]}</span>
                      <span>{localeNames[locale]}</span>
                      {locale === currentLocale && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({t("common.current")})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleLanguageChange}
                disabled={selectedLocale === currentLocale || isChanging}
              >
                {isChanging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardShell>
    </>
  );
}