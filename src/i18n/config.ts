import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './settings';
 
export default getRequestConfig(async ({ locale }) => {
  // Validate locale and fallback to default if invalid
  const validLocale: Locale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  
  // Load messages for the current locale
  const messages = (await import(`./locales/${validLocale}.json`)).default;
 
  return {
    messages,
    timeZone: 'UTC',
    now: new Date(),
    locale: validLocale,
  };
});