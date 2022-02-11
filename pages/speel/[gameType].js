import { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Head from "next/head";
import Image from "next/image";
import { Button, Text, Tooltip } from "@nextui-org/react";

import toast, { Toaster } from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { NextSeo } from "next-seo";
import { usePlausible } from "next-plausible";

import { getCurrentWordFromAirTable } from "../../lib/airtable";
import { getGameId } from "../../lib/gameId";
import { getIsGameOver } from "../../lib/helpers";
import {
  getSolution as getSsrSolution,
  getRandomWord as getSsrRandomWord,
  getDemoWords as getDemoWords,
} from "../../lib/ssr";
import { useGameState } from "../../lib/hooks";

import { setSettings } from "../../redux/features/settings";
import { getRandomWord, setRandomWord } from "../../redux/features/randomWord";
import { addWin, addLoss } from "../../redux/features/statistics";
import { setInputText } from "../../redux/features/inputText";
import {
  stop as stopTimer,
  reset as resetTimer,
} from "../../redux/features/timer";
import { setModal } from "../../redux/features/modal";

import {
  Main,
  Nav,
  InnerWrapper,
  Board,
  Row,
  Letter,
  LetterFront,
  LetterBack,
} from "../../components/styled";

import Header from "../../components/Header";
import Keyboard from "../../components/Keyboard";
import Results from "../../components/Results";
import Footer from "../../components/Footer";
import Splash from "../../components/Splash";
import Statistics from "../../components/Statistics";
import AddToHomeScreen from "../../components/AddToHomeScreen";

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

  const CORRECTED_GAME_ID = getGameId() - 1;
  const BOARD_SIZE = WORD_LENGTH + 1;

  const randomWord = useSelector((state) => state.randomWord);

  const inputText = useSelector((state) => state.inputText).value;
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(null);
  const fetchControllerRef = useRef(null);
  const [gameState, setGameState] = useGameState();
  const [modalClosed, setModalClosed] = useState(false);
  const { currentModal } = useSelector((state) => state.modal);

  const [solution, setSolution] = useState(ssrSolution);
  const { width, height } = useWindowSize();
  const isGameOver = useSelector(getIsGameOver);
  const colorBlind = useSelector((state) => state.settings?.colorBlind);
  const plausible = usePlausible();

  useEffect(() => {
    getSolution(gameType === "vrttaal" ? "vrttaal" : WORD_LENGTH).then(
      (solution) => setSolution(solution)
    );
  }, [WORD_LENGTH, gameType]);

  useEffect(() => {
    setShowConfetti(false);
    setModalClosed(false);
    dispatch(setSettings({ WORD_LENGTH, BOARD_SIZE, gameType }));
    dispatch(resetTimer());
  }, [WORD_LENGTH, gameType, BOARD_SIZE, dispatch]);

  useEffect(() => {
    if (isGameOver) {
      dispatch(setModal("results"));
    }
  }, [dispatch, isGameOver]);

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
        staggerChildren: 0.2,
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

  return WORD_LENGTH > 2 && WORD_LENGTH < 11 ? (
    <>
      <NextSeo
        title={`Woordje.be #${CORRECTED_GAME_ID} - nederlandstalige Wordle - ${WORD_LENGTH} letters`}
        description="Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland."
        canonical="https://www.woordje.be/"
        openGraph={{
          url: "https://www.woordje.be/",
          title: "Woordje.be",
          description:
            "Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland.",
          images: [
            {
              url: "https://www.woordje.be/twitter.png",
              width: 1200,
              height: 630,
              alt: "Woordje.be",
              type: "image/png",
            },
          ],
          site_name: "Woordje.be",
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

        <InnerWrapper>
          <Board
            $loading={isLoading}
            style={{ "--word-length": WORD_LENGTH, "--shrink-size": "4px" }}>
            {gameState &&
              gameState.guesses.map((match, i) => (
                <Row
                  key={`gs_row${i}`}
                  variants={row}
                  initial={
                    i === gameState.guesses.length - 1 ? "hidden" : "show"
                  }
                  animate="show">
                  {match.map((item, i) => {
                    return (
                      <Letter variants={rowItem} key={`letter-${i}`}>
                        <LetterFront>{item.letter}</LetterFront>
                        <LetterBack $score={item.score}>
                          {item.letter}
                        </LetterBack>
                      </Letter>
                    );
                  })}
                </Row>
              ))}

            {gameState && gameState.guesses.length < BOARD_SIZE
              ? Array.from(
                  { length: BOARD_SIZE - gameState.guesses.length },
                  (_, i) => {
                    if (i === 0 && !isGameOver) {
                      return (
                        <Row
                          key={`gs_row${
                            gameState.guesses ? gameState.guesses.length : 0
                          }`}>
                          {inputText
                            .padEnd(WORD_LENGTH, "?")
                            .split("")
                            .map((letter, index) => (
                              <Letter
                                $focus={
                                  true &&
                                  index ===
                                    Math.min(
                                      Math.max(0, inputText.length),
                                      WORD_LENGTH - 1
                                    )
                                }
                                key={`letter-${i}-${index}`}>
                                <LetterFront>
                                  {letter === "?" ? null : letter}
                                </LetterFront>
                                <LetterBack>
                                  {letter === "?" ? null : letter}
                                </LetterBack>
                              </Letter>
                            ))}
                        </Row>
                      );
                    } else {
                      return (
                        <Row key={`row_${i}`}>
                          {Array.from({ length: WORD_LENGTH }, (_, j) => (
                            <Letter $disabled={true} key={`disabled-${i}-${j}`}>
                              <LetterFront></LetterFront>
                              <LetterBack></LetterBack>
                            </Letter>
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
        </InnerWrapper>
        <Footer WORD_LENGTH={WORD_LENGTH} BOARD_SIZE={BOARD_SIZE} />
      </Main>

      <Splash visible={currentModal === "splash"} words={ssrDemoWords} />
      <Statistics visible={currentModal === "statistics"} />
      <Results
        visible={currentModal === "results"}
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
    const { Woord } = await getCurrentWordFromAirTable();
    return {
      props: {
        gameType: gameType,
        WORD_LENGTH: Woord.length,
        ssrSolution: await getSsrSolution(gameType),
        ssrRandomWord: getSsrRandomWord(Woord.length),
        ssrDemoWords: getDemoWords(Woord.length),
      },
      revalidate: 60,
    };
  } else {
    return {
      props: {
        gameType: `normal-${gameType}`,
        ssrSolution: await getSsrSolution(parseInt(gameType, 10)),
        WORD_LENGTH: parseInt(gameType, 10),
        ssrRandomWord: getSsrRandomWord(parseInt(gameType, 10)),
        ssrDemoWords: getDemoWords(parseInt(gameType, 10)),
      },
      revalidate: 60,
    };
  }
};

export async function getStaticPaths() {
  const items = ["3", "4", "5", "6", "7", "8", "9", "10", "vrttaal"];

  const paths = items.map((item) => ({
    params: { gameType: item },
  }));

  return { paths, fallback: "blocking" };
}
