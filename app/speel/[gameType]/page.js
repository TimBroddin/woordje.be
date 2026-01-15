import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/config";
import { getTodaysGameId } from "@/lib/gameId";
import { getSolution, getRandomWord, getRandomWords } from "@/lib/data/solution";
import { getStatistics } from "@/lib/data/statistics";
import GameClient from "./game-client";

// ISR - revalidate every 60 seconds
export const revalidate = 60;

// Generate static pages for all word lengths
export async function generateStaticParams() {
  return ["3", "4", "5", "6", "7", "8", "9", "10"].map((gameType) => ({
    gameType,
  }));
}

export async function generateMetadata({ params }) {
  const { gameType } = await params;
  const wordLength = parseInt(gameType);

  if (wordLength < 3 || wordLength > 10) {
    return {};
  }

  const translations = await getTranslations();
  const gameId = getTodaysGameId();
  const displayGameId = translations.id === "woordje" ? gameId : gameId - 36;

  return {
    title: `${translations.title} #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`,
    description: translations.description,
    openGraph: {
      title: `${translations.title} #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`,
      description: translations.description,
      url: translations.url,
      siteName: translations.title,
      images: [
        {
          url: `${translations.url}/og.png?v=2`,
          width: 1200,
          height: 630,
          alt: translations.title,
        },
      ],
    },
    twitter: {
      card: "summary",
      creator: "@timbroddin",
    },
    alternates: {
      canonical: translations.url,
    },
  };
}

export default async function GamePage({ params }) {
  const { gameType } = await params;
  const wordLength = parseInt(gameType);

  // Validate word length
  if (wordLength < 3 || wordLength > 10) {
    notFound();
  }

  const gameId = getTodaysGameId();
  const translations = await getTranslations();

  // Fetch all SSR data in parallel
  const [solution, statistics] = await Promise.all([
    getSolution(gameId, wordLength),
    getStatistics(gameId, wordLength, "normal"),
  ]);

  const randomWord = getRandomWord(wordLength);
  const demoWords = getRandomWords(3, wordLength);

  return (
    <GameClient
      gameId={gameId}
      wordLength={wordLength}
      gameType={`normal-${gameType}`}
      ssr={{
        solution,
        randomWord,
        demoWords,
        statistics,
      }}
      locale={translations.id === "woordje" ? "nl-BE" : "nl-NL"}
    />
  );
}
