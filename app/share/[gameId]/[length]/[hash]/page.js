import { redirect } from "next/navigation";
import { getTranslations } from "@/lib/i18n/config";

export async function generateMetadata({ params }) {
  const { gameId, length, hash } = await params;
  const translations = await getTranslations();
  const wordLength = parseInt(length);

  // Calculate display game ID based on locale
  const displayGameId =
    translations.id === "woordje" ? parseInt(gameId) : parseInt(gameId) - 36;

  // Parse the hash to extract game result lines
  const lines = hash.match(new RegExp(`.{1,${wordLength}}`, "g")) || [];

  // Check if won (last line is all "V"s)
  const wonPattern = Array.from({ length: wordLength })
    .map(() => "V")
    .join("");
  const won = lines.length > 0 && lines[lines.length - 1] === wonPattern;
  const tries = won ? lines.length : "X";

  const title = `${translations.title} #${displayGameId} x ${length} - ${tries}/${wordLength + 1}`;
  const description = lines.join("\n");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: translations.title,
      images: [
        {
          url: `${translations.url}/og.png`,
          width: 1200,
          height: 630,
          alt: translations.title,
        },
      ],
    },
    twitter: {
      creator: "@timbroddin",
      card: "summary",
    },
  };
}

export default function SharePage() {
  // Redirect to home page after meta tags are served
  redirect("/");
}
