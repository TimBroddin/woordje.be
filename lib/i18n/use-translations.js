"use client";

import { useMemo } from "react";
import { getTranslationsFromLocale, getLocaleFromHostname } from "./translations";

/**
 * Client-side hook for translations
 * Detects locale from window.location.hostname
 */
export function useTranslations(localeOverride) {
  const locale = useMemo(() => {
    if (localeOverride) return localeOverride;
    if (typeof window === "undefined") return "nl-BE";
    return getLocaleFromHostname(window.location.hostname);
  }, [localeOverride]);

  return useMemo(() => getTranslationsFromLocale(locale), [locale]);
}

/**
 * Get current locale on client side
 */
export function useLocale() {
  return useMemo(() => {
    if (typeof window === "undefined") return "nl-BE";
    return getLocaleFromHostname(window.location.hostname);
  }, []);
}
