import { locales, defaultLocale } from './settings';
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation';
import Link from 'next/link';
import { redirect as nextRedirect } from 'next/navigation';

// Re-export Next.js navigation functions with wrappers for i18n
export { Link };

// Wrapper for useRouter to handle i18n
export function useRouter() {
  const router = useNextRouter();
  return router;
}

// Wrapper for usePathname to handle i18n
export function usePathname() {
  const pathname = useNextPathname();
  return pathname;
}

// Wrapper for redirect to handle i18n
export function redirect(path: string) {
  return nextRedirect(path);
}

// Function to get the localized path
export function getLocalizedPath(path: string, locale: string): string {
  // If path already starts with a locale, replace it
  for (const loc of locales) {
    if (path.startsWith(`/${loc}/`)) {
      return `/${locale}${path.substring(loc.length + 1)}`;
    }
    if (path === `/${loc}`) {
      return `/${locale}`;
    }
  }
  
  // Otherwise, add the locale prefix
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

// Function to get the path without locale
export function getPathWithoutLocale(path: string): string {
  for (const locale of locales) {
    if (path.startsWith(`/${locale}/`)) {
      return path.substring(locale.length + 1);
    }
    if (path === `/${locale}`) {
      return '/';
    }
  }
  return path;
}