import { useEffect } from "react";
import { useSelector } from "react-redux";

import Image from "next/image";

import { NextSeo } from "next-seo";

// HELPERS & HOOKS
import { getCurrentWordFromAirTable } from "@/lib/airtable";
import { getSolution, getRandomWord, getRandomWords } from "@/lib/server";
import { useTranslations } from "@/lib/i18n";
import { useDisplayGameId } from "@/lib/hooks";

// COMPONENTS
import { Main } from "@/components/styled";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Game from "@/components/Game";
import { getTodaysGameId } from "@/lib/gameId";

export default function Home({
  gameType,
  gameId,
  wordLength,
  ssrSolution,
  ssrRandomWord,
  ssrDemoWords,
}) {
  const boardSize = wordLength + 1;
  const displayGameId = useDisplayGameId(gameId);
  const { colorBlind } = useSelector((state) => state.settings);
  const translations = useTranslations();

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (colorBlind) {
        document.body.classList.add("colorblind");
      } else {
        document.body.classList.remove("colorblind");
      }
    }
  }, [colorBlind]);

  return wordLength > 2 && wordLength < 11 && gameId < getTodaysGameId() ? (
    <>
      <NextSeo
        title={`${translations.title} #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`}
        description={`${translations.description}`}
        canonical={translations.url}
        openGraph={{
          url: translations.url,
          title: `${translations.title} #${displayGameId} - nederlandstalige Wordle - ${wordLength} letters`,
          description: translations.description,
          images: [
            {
              url: `${translations.url}/og.png?v=2`,
              width: 1200,
              height: 630,
              alt: translations.title,
              type: "image/png",
            },
          ],
          site_name: translations.title,
        }}
        twitter={{
          handle: "@timbroddin",
          cardType: "summary",
        }}
      />

      <Main>
        <Header
          customTitle={`Archief`}
          subtitle={`${translations.title} #${displayGameId} x ${wordLength}`}
          titleSize={40}
        />

        <Game
          gameId={gameId}
          wordLength={wordLength}
          gameType={gameType}
          ssrDemoWords={ssrDemoWords}
          ssrRandomWord={ssrRandomWord}
          ssrSolution={ssrSolution}
        />

        <Footer gameId={gameId} wordLength={wordLength} boardSize={boardSize} />
      </Main>
    </>
  ) : (
    <Main>
      <Image
        src="https://media.giphy.com/media/9Tq8GKRP4nwl2/giphy.gif"
        alt="Computer says no"
        width={320}
        height={240}
      />
    </Main>
  );
}

export const getStaticProps = async (ctx) => {
  const { params, locale } = ctx;
  const { query } = params;
  const [gameId, gameType] = query.split("x");

  if (gameType === "vrttaal") {
    try {
      const { Woord } = await getCurrentWordFromAirTable();
      return {
        props: {
          gameType: gameType,
          gameId: parseInt(gameId, 10),
          wordLength: Woord.length,
          ssrSolution: Woord,
          ssrRandomWord: getRandomWord(Woord.length),
          ssrDemoWords: getDemoWords(Woord.length),
        },
        revalidate: 60,
      };
    } catch (e) {
      return {
        props: {},
        revalidate: 60,
      };
    }
  } else {
    const wordLength = parseInt(gameType);
    const correctedGameId =
      locale === "nl-NL" ? parseInt(gameId) + 36 : parseInt(gameId);
    return {
      props: {
        gameType: `normal-${gameType}`,
        ssrSolution: await getSolution(correctedGameId, wordLength),
        wordLength,
        gameId: correctedGameId,
        ssrRandomWord: getRandomWord(wordLength),
        ssrDemoWords: getRandomWords(3, wordLength),
      },
      revalidate: 60,
    };
  }
};

export async function getStaticPaths() {
  const locales = ["nl-BE", "nl-NL"];
  const levels = ["3", "4", "5", "6", "7", "8", "9", "10"];
  const paths = [];

  for (let locale of locales) {
    const maxGameId =
      locale === "nl-BE" ? getTodaysGameId() : getTodaysGameId() - 36;
    for (let level of levels) {
      for (let i = 1; i <= maxGameId; i++) {
        paths.push({
          params: { query: `${i}x${level}`, locale: locale },
        });
      }
    }
  }

  return { paths, fallback: "blocking" };
}
