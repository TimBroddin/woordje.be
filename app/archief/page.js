import ArchiveClient from "./archive-client";

export const metadata = {
  title: "Woordje - Archief",
  description: "Een dagelijks woordspelletje gebaseerd op Wordle, met 3 tot 10 letters.",
  openGraph: {
    title: "Woordje - Archief",
    description: "Een dagelijks woordspelletje gebaseerd op Wordle, met 3 tot 10 letters.",
    images: [
      {
        url: "/og.png?v=2",
        width: 1200,
        height: 630,
        alt: "Woordje",
      },
    ],
    siteName: "Woordje",
  },
  twitter: {
    creator: "@timbroddin",
    card: "summary",
  },
};

export default function ArchivePage() {
  // Client component will auto-detect locale from hostname
  return <ArchiveClient />;
}
