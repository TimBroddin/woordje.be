import { headers } from "next/headers";
import { translations, getTranslationsFromLocale, getLocaleFromHostname } from "./translations";

/**
 * Get translations for use in server components
 * Reads locale from x-locale header set by middleware
 */
export async function getTranslations() {
  try {
    const headersList = await headers();
    const locale = headersList.get("x-locale") || "nl-BE";
    return translations[locale] || translations["nl-BE"];
  } catch {
    // During static generation, headers() may not be available
    // Default to nl-BE
    return translations["nl-BE"];
  }
}

// Re-export for convenience
export { translations, getTranslationsFromLocale, getLocaleFromHostname };
