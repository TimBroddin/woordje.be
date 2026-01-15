import PlausibleProvider from "next-plausible";
import { getTranslations } from "@/lib/i18n/config";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "@/styles/globals.css";

export async function generateMetadata() {
  const translations = await getTranslations();

  return {
    title: translations.title,
    description: translations.description,
    applicationName: translations.title,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: translations.title,
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      google: "notranslate",
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }) {
  const translations = await getTranslations();

  return (
    <html lang="nl" translate="no" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          hrefLang={translations.alternate_lang}
          href={translations.alternate_url}
        />
        <link rel="apple-touch-icon" href="/icons/favicon-180.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/favicon-512.png"
        />
        <link rel="manifest" href={`/${translations.manifest}`} />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <PlausibleProvider
          domain={translations.plausible}
          customDomain="https://stats.broddin.be"
        >
          <ClientProviders>{children}</ClientProviders>
        </PlausibleProvider>
      </body>
    </html>
  );
}
