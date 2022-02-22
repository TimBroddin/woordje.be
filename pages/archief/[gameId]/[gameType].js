import { useEffect } from "react";
import { useSelector } from "react-redux";

import Image from "next/image";

import { NextSeo } from "next-seo";
import { usePlausible } from "next-plausible";

// HELPERS & HOOKS
import { getCurrentWordFromAirTable } from "../../../lib/airtable";
import { getSolution, getRandomWord, getDemoWords } from "../../../lib/ssr";
import { useTranslations } from "../../../lib/i18n";
import { useCorrectedGameId } from "../../../lib/hooks";

// COMPONENTS
import { Main } from "../../../components/styled";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Game from "../../../components/Game";

export default function Home({
  gameType,
  gameId,
  wordLength,
  ssrSolution,
  ssrRandomWord,
  ssrDemoWords,
}) {
  const boardSize = wordLength + 1;

  const { colorBlind } = useSelector((state) => state.settings);
  const translations = useTranslations();
  const correctedGameId = useCorrectedGameId(gameId);

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
    <>
      <NextSeo
        title={`${translations.title} #${gameId} - nederlandstalige Wordle - ${wordLength} letters`}
        description={`${translations.description}`}
        canonical={translations.url}
        openGraph={{
          url: translations.url,
          title: `${translations.title} #${gameId} - nederlandstalige Wordle - ${wordLength} letters`,
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
          subtitle={`${translations.title} #${correctedGameId}`}
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

        <Footer wordLength={wordLength} boardSize={boardSize} />
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
  const { gameType, gameId } = ctx.params;
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
    return {
      props: {
        gameType: `normal-${gameType}`,
        ssrSolution: await getSolution(
          parseInt(gameType, 10),
          parseInt(gameId, 10),
          true,
          ctx.locale
        ),
        wordLength: parseInt(gameType, 10),
        gameId: parseInt(gameId, 10),

        ssrRandomWord: getRandomWord(parseInt(gameType, 10)),
        ssrDemoWords: getDemoWords(parseInt(gameType, 10)),
      },
      revalidate: 60,
    };
  }
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}
