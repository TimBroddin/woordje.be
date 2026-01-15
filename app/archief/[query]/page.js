import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "@/lib/i18n/config";
import { getTodaysGameId } from "@/lib/gameId";
import { getSolution, getRandomWord, getRandomWords } from "@/lib/data/solution";
import { getStatistics } from "@/lib/data/statistics";
import ArchiveGameClient from "./archive-game-client";

// ISR - revalidate every 10 minutes
export const revalidate = 600;

// Don't pre-generate any archive pages, generate on demand
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { query } = await params;
  const [gameIdStr, wordLengthStr] = query.split("x");

  const translations = await getTranslations();
  const displayGameId = parseInt(gameIdStr);
  const wordLength = parseInt(wordLengthStr);

  if (isNaN(displayGameId) || isNaN(wordLength) || wordLength < 3 || wordLength > 10) {
    return {};
  }

  return {
    title: `${translations.title} #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`,
    description: translations.description,
    openGraph: {
      url: translations.url,
      title: `${translations.title} #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`,
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

export default async function ArchiveGamePage({ params }) {
  const { query } = await params;
  const [gameIdStr, wordLengthStr] = query.split("x");
  const translations = await getTranslations();

  const displayGameId = parseInt(gameIdStr);
  const wordLength = parseInt(wordLengthStr);

  // Correct gameId based on locale
  const gameId =
    translations.id === "woordol" ? displayGameId + 36 : displayGameId;

  // Validate inputs
  if (
    isNaN(displayGameId) ||
    isNaN(wordLength) ||
    wordLength < 3 ||
    wordLength > 10
  ) {
    notFound();
  }

  // Prevent playing future games
  if (gameId >= getTodaysGameId()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Image
          src="https://media.giphy.com/media/9Tq8GKRP4nwl2/giphy.gif"
          alt="Computer says no"
          width={320}
          height={240}
        />
      </div>
    );
  }

  // Fetch all SSR data in parallel
  const [solution, statistics] = await Promise.all([
    getSolution(gameId, wordLength),
    getStatistics(gameId, wordLength, "normal"),
  ]);

  const randomWord = getRandomWord(wordLength);
  const demoWords = getRandomWords(3, wordLength);

  return (
    <ArchiveGameClient
      gameId={gameId}
      displayGameId={displayGameId}
      wordLength={wordLength}
      gameType={`normal-${wordLength}`}
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
