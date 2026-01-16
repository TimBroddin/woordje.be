"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

/**
 * Client component that injects locale-specific head elements
 * Detects locale from hostname and adds appropriate alternate links and manifest
 */
export function LocaleHead() {
  const translations = useTranslations();

  return (
    <>
      <link
        rel="alternate"
        hrefLang={translations.alternate_lang}
        href={translations.alternate_url}
      />
      <link rel="manifest" href={`/${translations.manifest}`} />
    </>
  );
}
