import { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Head from "next/head";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { NextSeo } from "next-seo";
import { usePlausible } from "next-plausible";

import { getGameId } from "../../lib/gameId";
import { getIsGameOver } from "../../lib/helpers";
import { useGameState } from "../../lib/hooks";

import { setSettings } from "../../redux/features/settings";
import { getRandomWord } from "../../redux/features/randomWord";
import { addWin, addLoss } from "../../redux/features/statistics";
import { setInputText } from "../../redux/features/inputText";
import {
  stop as stopTimer,
  reset as resetTimer,
} from "../../redux/features/timer";

import {
  Main,
  InnerWrapper,
  ScreenWrapper,
  Board,
  Row,
  Letter,
} from "../../components/styled";

import Keyboard from "../../components/Keyboard";
import Results from "../../components/Results";
import Footer from "../../components/Footer";
import Splash from "../../components/Splash";
import AddToHomeScreen from "../../components/AddToHomeScreen";

async function check(word, WORD_LENGTH, opts) {
  const res = await fetch(
    `/api/check?word=${encodeURIComponent(word)}&l=${WORD_LENGTH}`,
    opts
  );
  return await res.json();
}

async function getSolutions() {
  const res = await fetch(`/api/solutions`);
  return await res.json();
}

export default function Home({ WORD_LENGTH }) {
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
  const [solutions, setSolutions] = useState([]);
  const { width, height } = useWindowSize();
  const isGameOver = useSelector(getIsGameOver);
  const { visible: showSplash } = useSelector((state) => state.splash);
  const colorBlind = useSelector((state) => state.settings?.colorBlind);
  const plausible = usePlausible();

  const ConditionalScreenWrapper =
    width > 768 ? ({ children }) => children : ScreenWrapper;

  useEffect(() => {
    getSolutions().then((solutions) => setSolutions(solutions));
  }, []);

  useEffect(() => {
    setShowConfetti(false);
    setModalClosed(false);
    dispatch(setSettings({ WORD_LENGTH, BOARD_SIZE }));
    dispatch(resetTimer());
  }, [WORD_LENGTH, BOARD_SIZE, dispatch]);

  useEffect(() => {
    dispatch(resetTimer());
  }, [CORRECTED_GAME_ID, dispatch]);

  useEffect(() => {
    dispatch(getRandomWord());
  }, [dispatch, WORD_LENGTH]);

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
        serverResponse = await check(text, WORD_LENGTH, {
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
          dispatch(addLoss({ gameId: getGameId(), WORD_LENGTH }));
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
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <Toaster />
      <AddToHomeScreen modalClosed={modalClosed} />
      {showConfetti ? (
        <Confetti
          numberOfPieces={300}
          recycle={false}
          width={width}
          height={height}
          initialVelocityY={-25}
        />
      ) : null}

      <Main $initializing={!gameState}>
        <InnerWrapper>
          <ConditionalScreenWrapper>
            <Board
              $loading={isLoading}
              style={{ "--word-length": WORD_LENGTH, "--shrink-size": "4px" }}>
              {gameState &&
                gameState.guesses.map((match, i) => (
                  <Row key={`gs_row${i}`}>
                    {match.map((item, i) => {
                      return (
                        <Letter key={`letter-${i}`} $score={item.score}>
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
                      if (i === 0 && !isGameOver) {
                        return (
                          <Row key="row_input">
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
                                $disabled={true}
                                key={`disabled-${i}-${j}`}></Letter>
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
          </ConditionalScreenWrapper>

          <Footer WORD_LENGTH={WORD_LENGTH} BOARD_SIZE={BOARD_SIZE} />
        </InnerWrapper>
      </Main>
      {showSplash && (!isGameOver || modalClosed) ? <Splash /> : null}

      {isGameOver && !modalClosed ? (
        <Results
          WORD_LENGTH={WORD_LENGTH}
          gameState={gameState}
          solutions={solutions}
          close={() => setModalClosed(true)}
          toast={toast}
        />
      ) : null}
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

export const getServerSideProps = async (ctx) => {
  return {
    props: {
      WORD_LENGTH: parseInt(ctx.query.length, 10),
    },
  };
};
