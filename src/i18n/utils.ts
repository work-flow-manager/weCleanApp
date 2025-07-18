import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './settings';

// Create shared navigation functions
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  localePrefix: 'as-needed'
});

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