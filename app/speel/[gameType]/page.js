import { notFound } from "next/navigation";
import { getTodaysGameId } from "@/lib/gameId";
import { getSolution, getRandomWord, getRandomWords } from "@/lib/data/solution";
import { getStatistics } from "@/lib/data/statistics";
import GameClient from "./game-client";

// ISR - revalidate every hour (client checks for midnight staleness)
export const revalidate = 3600;

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

  const gameId = getTodaysGameId();

  // Use generic metadata for ISR compatibility
  // Client will show locale-specific content
  return {
    title: `Woordje #${gameId} - nederlandstalige Wordle - ${wordLength} letters`,
    description: "Een dagelijks woordspelletje gebaseerd op Wordle, met 3 tot 10 letters.",
    openGraph: {
      title: `Woordje #${gameId} - nederlandstalige Wordle - ${wordLength} letters`,
      description: "Een dagelijks woordspelletje gebaseerd op Wordle, met 3 tot 10 letters.",
      siteName: "Woordje",
      images: [
        {
          url: "/og.png?v=2",
          width: 1200,
          height: 630,
          alt: "Woordje",
        },
      ],
    },
    twitter: {
      card: "summary",
      creator: "@timbroddin",
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
    />
  );
}
