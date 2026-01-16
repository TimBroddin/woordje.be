import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslationsStatic } from "@/lib/i18n/config";
import { getTodaysGameId } from "@/lib/gameId";
import { getSolution, getRandomWord, getRandomWords } from "@/lib/data/solution";
import { getStatistics } from "@/lib/data/statistics";
import ArchiveGameClient from "./archive-game-client";

// ISR - revalidate every 24 hours (archive content doesn't change)
export const revalidate = 86400;

// Don't pre-generate any archive pages, generate on demand
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { query } = await params;
  const [gameIdStr, wordLengthStr] = query.split("x");

  // Use static translations for ISR compatibility
  // Generic metadata works for both domains
  const displayGameId = parseInt(gameIdStr);
  const wordLength = parseInt(wordLengthStr);

  if (isNaN(displayGameId) || isNaN(wordLength) || wordLength < 3 || wordLength > 10) {
    return {};
  }

  return {
    title: `Woordje #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`,
    description: "Een dagelijks woordspelletje gebaseerd op Wordle, met 3 tot 10 letters.",
    openGraph: {
      title: `Woordje #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`,
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
}

export default async function ArchiveGamePage({ params }) {
  const { query } = await params;
  const [gameIdStr, wordLengthStr] = query.split("x");

  const displayGameId = parseInt(gameIdStr);
  const wordLength = parseInt(wordLengthStr);

  // Validate inputs
  if (
    isNaN(displayGameId) ||
    isNaN(wordLength) ||
    wordLength < 3 ||
    wordLength > 10
  ) {
    notFound();
  }

  // For ISR, we use the displayGameId directly (nl-BE style)
  // The client component will handle the locale-specific gameId offset
  const gameId = displayGameId;

  // Prevent playing future games (use base gameId without locale offset)
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
      displayGameId={displayGameId}
      wordLength={wordLength}
      gameType={`normal-${wordLength}`}
      ssr={{
        solution,
        randomWord,
        demoWords,
        statistics,
      }}
    />
  );
}
