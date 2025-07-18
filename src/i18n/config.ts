import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async ({ locale }) => {
  // Load messages for the current locale
  const messages = (await import(`./locales/${locale}.json`)).default;
 
  return {
    messages,
    timeZone: 'UTC',
    now: new Date(),
  };
});