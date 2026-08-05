"use client";

import Script from "next/script";
import { useTranslations } from "@/lib/i18n/use-translations";

/**
 * Rybbit analytics. The site id depends on the domain, which is detected
 * client-side from the hostname (same approach as LocaleHead).
 */
export function Analytics() {
  const translations = useTranslations();

  return (
    <Script
      src="https://stats.titans.sh/api/script.js"
      data-site-id={translations.rybbit}
      strategy="afterInteractive"
    />
  );
}
