export const locales = ['en', 'es', 'pt', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ar: 'العربية',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  pt: '🇧🇷',
  ar: '🇸🇦',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  pt: 'ltr',
  ar: 'rtl',
};

// Function to get locale from string with fallback to default
export function getLocale(locale: string | undefined): Locale {
  if (!locale) return defaultLocale;
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}