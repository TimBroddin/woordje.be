import PlausibleProvider from "next-plausible";
import { getTranslationsStatic } from "@/lib/i18n/config";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { LocaleHead } from "@/components/LocaleHead";
import "@/styles/globals.css";

// Use static translations for ISR compatibility
const defaultTranslations = getTranslationsStatic();

export const metadata = {
  title: defaultTranslations.title,
  description: defaultTranslations.description,
  applicationName: defaultTranslations.title,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: defaultTranslations.title,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    google: "notranslate",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl" translate="no" suppressHydrationWarning>
      <head>
        <LocaleHead />
        <link rel="apple-touch-icon" href="/icons/favicon-180.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/favicon-512.png"
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <PlausibleProvider
          domain={defaultTranslations.plausible}
          customDomain="https://stats.broddin.be"
          selfHosted={true}
        >
          <ClientProviders>{children}</ClientProviders>
        </PlausibleProvider>
      </body>
    </html>
  );
}
