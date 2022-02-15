import { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Image from "next/image";

import toast, { Toaster } from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { NextSeo } from "next-seo";
import { usePlausible } from "next-plausible";

// HELPERS & HOOKS
import { getCurrentWordFromAirTable } from "../../lib/airtable";
import { getGameId } from "../../lib/gameId";
import { getIsGameOverSelector, getIsVictorySelector } from "../../lib/helpers";
import {
  getSolution as getSsrSolution,
  getRandomWord as getSsrRandomWord,
  getDemoWords as getSsrDemoWords,
} from "../../lib/ssr";
import { useGameState, useBrand, useCorrectedGameId } from "../../lib/hooks";

// REDUX
import { setSettings } from "../../redux/features/settings";
import { getRandomWord, setRandomWord } from "../../redux/features/randomWord";
import { addWin, addLoss } from "../../redux/features/statistics";
import { setInputText } from "../../redux/features/inputText";
import {
  stop as stopTimer,
  reset as resetTimer,
} from "../../redux/features/timer";
import { setModal, hide as hideModal } from "../../redux/features/modal";

// COMPONENTS
import { Main, Board, Row } from "../../components/styled";
import Header from "../../components/Header";
import Letter from "../../components/Letter";
import Keyboard from "../../components/Keyboard";
import Results from "../../components/Results";
import Footer from "../../components/Footer";
import Splash from "../../components/Splash";
import Statistics from "../../components/Statistics";
import AddToHomeScreen from "../../components/AddToHomeScreen";

const STAGGER = 0.15;

async function check(word, gameType, WORD_LENGTH, opts) {
  const res = await fetch(
    `/api/check?word=${encodeURIComponent(word)}&l=${
      gameType === "vrttaal" ? gameType : WORD_LENGTH
    }`,
    opts
  );
  return await res.json();
}

async function getSolution(l) {
  const res = await fetch(`/api/solution?l=${l}`);
  return await res.json();
}

export default function Home({
  gameType,
  WORD_LENGTH,
  ssrSolution,
  ssrRandomWord,
  ssrDemoWords,
}) {
  const dispatch = useDispatch();
  const CORRECTED_GAME_ID = useCorrectedGameId();
  const BOARD_SIZE = WORD_LENGTH + 1;

  const randomWord = useSelector((state) => state.randomWord);

  const inputText = useSelector((state) => state.inputText).value;
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(null);
  const fetchControllerRef = useRef(null);
  const [gameState, setGameState] = useGameState();
  const { currentModal } = useSelector((state) => state.modal);

  const [solution, setSolution] = useState(ssrSolution);
  const { width, height } = useWindowSize();
  const isGameOver = useSelector(getIsGameOverSelector);
  const isVictory = useSelector(getIsVictorySelector);
  const colorBlind = useSelector((state) => state.settings?.colorBlind);
  const brand = useBrand();
  const plausible = usePlausible();

  useEffect(() => {
    getSolution(gameType === "vrttaal" ? "vrttaal" : WORD_LENGTH).then(
      (solution) => setSolution(solution)
    );
  }, [WORD_LENGTH, gameType]);

  useEffect(() => {
    setShowConfetti(false);
    dispatch(setSettings({ WORD_LENGTH, BOARD_SIZE, gameType }));
    dispatch(resetTimer());
    dispatch(setInputText(""));
  }, [WORD_LENGTH, gameType, BOARD_SIZE, dispatch]);

  useEffect(() => {
    if (currentModal && !isGameOver && currentModal === "results") {
      //dispatch(hideModal());
    }
  }, [currentModal, dispatch, gameType, isGameOver]);

  useEffect(() => {
    if (isGameOver) {
      getSolution(gameType === "vrttaal" ? "vrttaal" : WORD_LENGTH).then(
        (solution) => setSolution(solution)
      );
      setTimeout(() => {
        dispatch(setModal("results"));
      }, WORD_LENGTH * STAGGER * 1000);
    }
  }, [dispatch, isGameOver, WORD_LENGTH, gameType]);

  useEffect(() => {
    dispatch(resetTimer());
  }, [CORRECTED_GAME_ID, dispatch]);

  useEffect(() => {
    dispatch(setRandomWord(ssrRandomWord));
  }, [dispatch, ssrRandomWord]);

  useEffect(() => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    toast.dismiss("toast");
  }, [inputText]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (colorBlind) {
        document.body.classList.add("colorblind");
      } else {
        document.body.classList.remove("colorblind");
      }
    }
  }, [colorBlind]);

  const submit = useCallback(
    async (text) => {
      if (fetchControllerRef.current) fetchControllerRef.current.abort();
      const controller = new AbortController();
      fetchControllerRef.current = controller;

      setIsLoading(true);
      toast.loading("Controleren...", { id: "toast", duration: Infinity });
      if (text === randomWord.value) {
        dispatch(getRandomWord());
      }

      let serverResponse;
      try {
        serverResponse = await check(text, gameType, WORD_LENGTH, {
          signal: controller.signal,
        });
      } catch (err) {
        if (err.name === "AbortError") {
          toast.dismiss("toast");
        } else {
          toast.error("Unknown error", { id: "toast" });
        }
        return;
      } finally {
        setIsLoading(false);
        fetchControllerRef.current = null;
      }

      let { error, match } = serverResponse;

      if (error) {
        if (error === "unknown_word") {
          toast.error("Ongeldig woord", { id: "toast", duration: 1000 });
        }
      } else {
        toast.dismiss("toast");

        dispatch(setInputText(""));
        if (!match.some((i) => i.score !== "good")) {
          setShowConfetti(true);
          plausible("win", {
            props: {
              length: WORD_LENGTH,
              tries: `${gameState.guesses.length + 1}/${BOARD_SIZE}`,
              game: `${CORRECTED_GAME_ID}x${WORD_LENGTH}`,
            },
          });
          dispatch(stopTimer());
          dispatch(
            addWin({
              gameId: getGameId(),
              WORD_LENGTH,
              gameType,
              guesses: gameState.guesses.length + 1,
            })
          );

          // increment streak
        } else if (gameState.guesses.length + 1 === BOARD_SIZE) {
          dispatch(stopTimer());

          plausible("lose", {
            props: {
              length: WORD_LENGTH,
              game: `${CORRECTED_GAME_ID}x${WORD_LENGTH}`,
            },
          });
          dispatch(addLoss({ gameId: getGameId(), gameType, WORD_LENGTH }));
        }

        setGameState({
          gameId: getGameId(),
          WORD_LENGTH,
          guesses: gameState.guesses.concat([match]),
        });
      }
    },
    [
      BOARD_SIZE,
      CORRECTED_GAME_ID,
      WORD_LENGTH,
      gameState.guesses,
      plausible,
      randomWord,
      setGameState,
      dispatch,
      gameType,
    ]
  );

  const onSubmit = useCallback(() => {
    if (gameState && !isGameOver) {
      if (!fetchControllerRef.current && inputText.length === WORD_LENGTH) {
        submit(inputText);
      }
    }
  }, [
    inputText,
    WORD_LENGTH,
    fetchControllerRef,
    isGameOver,
    submit,
    gameState,
  ]);

  const row = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: STAGGER,
      },
    },
  };

  const rowItem = {
    hidden: {
      rotateY: 0,
    },
    show: {
      rotateY: 180,
    },
  };

  const letterBorderRadius = (
    rowIndex,
    totalRows,
    letterIndex,
    totalLLetters
  ) => {
    const borderRadius = "7px";
    if (rowIndex === 0 && letterIndex === 0) {
      return { borderTopLeftRadius: borderRadius };
    }
    if (rowIndex === 0 && letterIndex === totalLLetters - 1) {
      return { borderTopRightRadius: borderRadius };
    }
    if (rowIndex === totalRows - 1 && letterIndex === 0) {
      return { borderBottomLeftRadius: borderRadius };
    }
    if (rowIndex === totalRows - 1 && letterIndex === totalLLetters - 1) {
      return { borderBottomRightRadius: borderRadius };
    }
  };

  return WORD_LENGTH > 2 && WORD_LENGTH < 11 ? (
    <>
      <NextSeo
        title={`${brand.title} #${CORRECTED_GAME_ID} - nederlandstalige Wordle - ${WORD_LENGTH} letters`}
        description={`${brand.description}`}
        canonical={brand.url}
        openGraph={{
          url: brand.url,
          title: `${brand.title} #${CORRECTED_GAME_ID} - nederlandstalige Wordle - ${WORD_LENGTH} letters`,
          description: brand.description,
          images: [
            {
              url: `${brand.url}/og.png?v=2`,
              width: 1200,
              height: 630,
              alt: brand.title,
              type: "image/png",
            },
          ],
          site_name: brand.title,
        }}
        twitter={{
          handle: "@timbroddin",
          cardType: "summary",
        }}
      />

      <Toaster />
      <AddToHomeScreen />
      {showConfetti ? (
        <Confetti
          numberOfPieces={300}
          recycle={false}
          width={width}
          height={height}
          initialVelocityY={-25}
        />
      ) : null}

      <Main>
        <Header />

        <Board
          loading={isLoading}
          style={{ "--word-length": WORD_LENGTH, "--shrink-size": "4px" }}>
          {gameState &&
            gameState.guesses.map((match, i) => (
              <Row
                key={`gs_row${i}`}
                variants={row}
                initial={i === gameState.guesses.length - 1 ? "hidden" : "show"}
                animate="show">
                {match.map((item, k) => {
                  return (
                    <Letter
                      key={`letter-${k}`}
                      radius={letterBorderRadius(i, BOARD_SIZE, k, WORD_LENGTH)}
                      score={item.score}>
                      {item.letter}
                    </Letter>
                  );
                })}
              </Row>
            ))}

          {gameState && gameState.guesses.length < BOARD_SIZE
            ? Array.from(
                { length: BOARD_SIZE - gameState.guesses.length },
                (_, i) => {
                  const idx = gameState.guesses
                    ? gameState.guesses.length + i
                    : i;
                  if (i === 0 && !isGameOver) {
                    return (
                      <Row key={`gs_row${idx}`}>
                        {inputText
                          .padEnd(WORD_LENGTH, "?")
                          .split("")
                          .map((letter, index) => (
                            <Letter
                              focus={
                                index ===
                                Math.min(
                                  Math.max(0, inputText.length),
                                  WORD_LENGTH - 1
                                )
                              }
                              key={`letter-${i}-${index}`}
                              radius={letterBorderRadius(
                                idx,
                                BOARD_SIZE,
                                index,
                                WORD_LENGTH
                              )}>
                              {letter === "?" ? null : letter}
                            </Letter>
                          ))}
                      </Row>
                    );
                  } else {
                    return (
                      <Row key={`row_${i}`}>
                        {Array.from({ length: WORD_LENGTH }, (_, j) => (
                          <Letter
                            disabled={true}
                            key={`disabled-${i}-${j}`}
                            radius={letterBorderRadius(
                              idx,
                              BOARD_SIZE,
                              j,
                              WORD_LENGTH
                            )}></Letter>
                        ))}
                      </Row>
                    );
                  }
                }
              )
            : null}
        </Board>
        <Keyboard
          gameState={gameState}
          onPress={(l) => {
            dispatch(
              setInputText(
                `${inputText}${l}`
                  .toLowerCase()
                  .replace(/[^a-z]+/g, "")
                  .slice(0, WORD_LENGTH)
              )
            );
          }}
          onBackspace={() => {
            dispatch(setInputText(inputText.slice(0, -1)));
          }}
          onSubmit={onSubmit}
        />
        <Footer WORD_LENGTH={WORD_LENGTH} BOARD_SIZE={BOARD_SIZE} />
      </Main>

      <Splash visible={currentModal === "splash"} words={ssrDemoWords} />
      <Statistics visible={currentModal === "statistics"} />
      <Results
        visible={currentModal === "results" && isGameOver}
        solution={solution}
        toast={toast}
      />
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
  const { gameType } = ctx.params;

  if (gameType === "vrttaal") {
    try {
      const { Woord } = await getCurrentWordFromAirTable();
      return {
        props: {
          gameType: gameType,
          WORD_LENGTH: Woord.length,
          ssrSolution: await getSsrSolution(gameType),
          ssrRandomWord: getSsrRandomWord(Woord.length),
          ssrDemoWords: getSsrDemoWords(Woord.length),
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
        ssrSolution: await getSsrSolution(parseInt(gameType, 10)),
        WORD_LENGTH: parseInt(gameType, 10),
        ssrRandomWord: getSsrRandomWord(parseInt(gameType, 10)),
        ssrDemoWords: getSsrDemoWords(parseInt(gameType, 10)),
      },
      revalidate: 60,
    };
  }
};

export async function getStaticPaths() {
  const items = ["3", "4", "5", "6", "7", "8", "9", "10", "vrttaal"];
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
