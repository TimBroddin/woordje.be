import { getTranslations } from "@/lib/i18n/config";
import ArchiveClient from "./archive-client";

export async function generateMetadata() {
  const translations = await getTranslations();

  return {
    title: `${translations.title} - Archief`,
    description: translations.description,
    openGraph: {
      url: translations.url,
      title: `${translations.title} - Archief`,
      description: translations.description,
      images: [
        {
          url: `${translations.url}/og.png?v=2`,
          width: 1200,
          height: 630,
          alt: translations.title,
        },
      ],
      siteName: translations.title,
    },
    twitter: {
      creator: "@timbroddin",
      card: "summary",
    },
  };
}

export default async function ArchivePage() {
  const translations = await getTranslations();

  return <ArchiveClient locale={translations.id === "woordje" ? "nl-BE" : "nl-NL"} />;
}
