import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Image from "next/image";

import { NextSeo } from "next-seo";
import { usePlausible } from "next-plausible";

// HELPERS & HOOKS
import {
  getSolution,
  getRandomWord,
  getRandomWords,
  getStatistics,
} from "@/lib/server";
import { useDisplayGameId, useCurrentGameId } from "@/lib/hooks";
import { useTranslations } from "@/lib/i18n";
import { getTodaysGameId } from "@/lib/gameId";

// Providers
import { StaticPropsProvider } from "@/lib/context/StaticProps";

// COMPONENTS
import { Main } from "@/components/styled";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Game from "@/components/Game";

export default function Home({ gameType, wordLength, ssr }) {
  const dispatch = useDispatch();
  const gameId = useCurrentGameId();
  const displayGameId = useDisplayGameId();
  const boardSize = wordLength + 1;

  const { colorBlind } = useSelector((state) => state.settings);
  const translations = useTranslations();
  const plausible = usePlausible();

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (colorBlind) {
        document.body.classList.add("colorblind");
      } else {
        document.body.classList.remove("colorblind");
      }
    }
  }, [colorBlind]);
  return wordLength > 2 && wordLength < 11 ? (
    <StaticPropsProvider value={ssr}>
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
        <Header />

        <Game gameId={gameId} wordLength={wordLength} gameType={gameType} />

        <Footer gameId={gameId} wordLength={wordLength} boardSize={boardSize} />
      </Main>
    </StaticPropsProvider>
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
  const { locale, params } = ctx;

  const { gameType } = params;

  const wordLength = parseInt(gameType);
  return {
    props: {
      gameType: `normal-${gameType}`,
      wordLength,

      ssr: {
        gameId: getTodaysGameId(),
        solution: await getSolution(getTodaysGameId(), wordLength),
        randomWord: getRandomWord(wordLength),
        demoWords: getRandomWords(3, wordLength),
        statistics: await getStatistics(
          getTodaysGameId(),
          wordLength,
          "normal"
        ),
      },
    },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  const items = ["3", "4", "5", "6", "7", "8", "9", "10"];
  const locales = ["nl-NL", "nl-BE"];
  const paths = [];

  items.forEach((item) => {
    locales.forEach((locale) => {
      paths.push({
        params: { gameType: item },
        locale,
      });
    });
  });

  return { paths, fallback: "blocking" };
}
