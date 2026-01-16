import { headers } from "next/headers";
import { translations, getTranslationsFromLocale, getLocaleFromHostname } from "./translations";

/**
 * Get translations for use in server components (dynamic pages only)
 * Reads locale from x-locale header set by middleware
 * WARNING: This makes the page dynamic - use getTranslationsStatic for ISR pages
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

/**
 * Get translations without using headers() - safe for ISR/static pages
 * Returns default locale translations. Client components should detect
 * actual locale from window.location.hostname
 */
export function getTranslationsStatic(locale = "nl-BE") {
  return translations[locale] || translations["nl-BE"];
}

// Re-export for convenience
export { translations, getTranslationsFromLocale, getLocaleFromHostname };
