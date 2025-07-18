"use client";

import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/settings";
import LanguageProvider from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TempoInit } from "@/components/tempo-init";
import { NotificationDeliverySystem } from "@/components/notifications";
import { Providers } from "@/app/providers";
import { Inter } from "next/font/google";
import Script from "next/script";
import "../../app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load the messages for the locale
  let messages;
  try {
    messages = (await import(`../../i18n/locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Providers>
              <NextIntlClientProvider locale={locale} messages={messages}>
                <LanguageProvider>
                  <NotificationDeliverySystem />
                  {children}
                </LanguageProvider>
              </NextIntlClientProvider>
            </Providers>
            <TempoInit />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}