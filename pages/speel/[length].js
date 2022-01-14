import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { NextSeo } from "next-seo";
import { usePlausible } from "next-plausible";

import { getGameId } from "../../lib/gameId";
import {
  readGameStateFromStorage,
  saveGameStateToStorage,
  cleanStorage,
} from "../../lib/state";
import { getIsGameOver } from "../../lib/helpers";

import {
  Main,
  InnerWrapper,
  Board,
  Row,
  Letter,
  Footer,
  Random,
} from "../../components/styled";

import Keyboard from "../../components/Keyboard";
import Results from "../../components/Results";

async function check(word, WORD_LENGTH, opts) {
  const res = await fetch(
    `/api/check?word=${encodeURIComponent(word)}&l=${WORD_LENGTH}`,
    opts
  );
  return await res.json();
}

async function getRandomword(length) {
  const res = await fetch(`/api/random?l=${length}`);
  return await res.text();
}

async function getSolutions() {
  const res = await fetch(`/api/solutions`);
  return await res.json();
}

export default function Home({ WORD_LENGTH }) {
  const CORRECTED_GAME_ID = getGameId() - 1;
  const BOARD_SIZE = WORD_LENGTH + 1;
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(null);
  const [randomWord, setRandomWord] = useState(null);
  const fetchControllerRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [modalClosed, setModalClosed] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const { width, height } = useWindowSize();
  const isGameOver = getIsGameOver(gameState, BOARD_SIZE);
  const plausible = usePlausible();

  useEffect(() => {
    cleanStorage();
    getSolutions().then((solutions) => setSolutions(solutions));
  }, []);

  useEffect(() => {
    getRandomword(WORD_LENGTH).then((word) => setRandomWord(JSON.parse(word)));
  }, [WORD_LENGTH]);

  useEffect(() => {
    console.log(`Loading state for ${WORD_LENGTH}`);
    setGameState({
      state: readGameStateFromStorage(WORD_LENGTH),
      initial: true,
    });
  }, [WORD_LENGTH]);

  useEffect(() => {
    if (gameState && !gameState.initial) {
      console.log(`Saving state for ${WORD_LENGTH}`);
      saveGameStateToStorage(gameState.state, WORD_LENGTH);
    } else {
    }
  }, [gameState]);

  useEffect(() => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    toast.dismiss("toast");
  }, [inputText]);

  async function submit(text) {
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setIsLoading(true);
    toast.loading("Controleren...", { id: "toast", duration: Infinity });

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

      setInputText("");
      setGameState((gameState) => {
        if (!match.some((i) => i.score !== "good")) {
          setShowConfetti(true);
          plausible("win", {
            props: {
              length: WORD_LENGTH,
              tries: `${gameState.state.length + 1}/${BOARD_SIZE}`,
              game: `${CORRECTED_GAME_ID}x${WORD_LENGTH}`,
            },
          });

          // increment streak
        } else if (gameState.state.length + 1 === BOARD_SIZE) {
          plausible("lose", {
            props: {
              length: WORD_LENGTH,
              game: `${CORRECTED_GAME_ID}x${WORD_LENGTH}`,
            },
          });
        }
        return {
          state: gameState.state.concat([match]),
          initial: false,
        };
      });
    }
  }

  function onSubmit() {
    setInputText((text) => {
      setGameState((gameState) => {
        if (gameState && !getIsGameOver(gameState)) {
          if (!fetchControllerRef.current && text.length === WORD_LENGTH) {
            submit(text);
          }
        }
        return gameState;
      });
      return text;
    });
  }

  return WORD_LENGTH > 2 && WORD_LENGTH < 9 ? (
    <>
      <NextSeo
        title={`Woordje.be #${CORRECTED_GAME_ID} - nederlandstalige Wordle`}
        description="Een dagelijks woordspelletje."
        canonical="https://www.woordje.be/"
        openGraph={{
          url: "https://www.woordje.be/",
          title: "Woordje.be",
          description: "Een dagelijks woordspelletje gebaseerd op Wordle.",
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
      {showConfetti ? (
        <Confetti
          numberOfPieces={300}
          recycle={false}
          width={width}
          height={height}
        />
      ) : null}
      <Main $initializing={!gameState}>
        <InnerWrapper>
          <Board $loading={isLoading}>
            {gameState &&
              gameState.state.map((match, i) => (
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

            {gameState && gameState.state.length < BOARD_SIZE
              ? Array.from(
                  { length: BOARD_SIZE - gameState.state.length },
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
                                  isFocused &&
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
              setInputText((text) =>
                `${text}${l}`
                  .toLowerCase()
                  .replace(/[^a-z]+/g, "")
                  .slice(0, WORD_LENGTH)
              );
            }}
            onBackspace={() => {
              setInputText((text) => text.slice(0, -1));
            }}
            onSubmit={onSubmit}
          />

          <Footer onClick={(e) => e.stopPropagation()}>
            <h1>Help</h1>
            <p>
              Raad het {WORD_LENGTH}-letterwoord in {BOARD_SIZE} beurten, of
              minder.
            </p>
            <p>
              Op desktop kan je gewoon beginnen typen, enter om je woord in te
              dienen. Op mobiel moet je eerst de vakjes aanraken.
            </p>
            <p>
              🟩 = letter staat op de juiste plek
              <br />
              🟨 = letter komt voor in het woord, maar niet op de juiste plek.{" "}
            </p>

            <p>Elke dag een nieuwe opgave!</p>

            <h1>Hulplijn</h1>
            <p>
              Hier is een willekeurig woord met {WORD_LENGTH} letters:{" "}
              <Random
                onClick={(e) =>
                  getRandomword(WORD_LENGTH).then((word) =>
                    setRandomWord(JSON.parse(word))
                  )
                }>
                {randomWord}
              </Random>
            </p>
            <h1>Te moeilijk/makkelijk?</h1>
            <p>
              Probeer ook eens met{" "}
              {[3, 4, 5, 6, 7, 8]
                .filter((x) => x !== WORD_LENGTH)
                .map((x, i) => (
                  <span key={`link-${x}`}>
                    <Link href={`/speel/${x}`}>
                      <a>{x}</a>
                    </Link>
                    {i < 3 ? ", " : i < 4 ? " of " : ""}
                  </span>
                ))}{" "}
              letters
            </p>

            <h1>
              Cr
              <span
                onDoubleClick={() =>
                  setGameState({ state: [], initial: true })
                }>
                e
              </span>
              dits
            </h1>
            <p>
              Gebaseerd op{" "}
              <a
                href="https://www.powerlanguage.co.uk/wordle/"
                rel="noreferrer"
                target="_blank">
                Wordle
              </a>{" "}
              en{" "}
              <a
                href="https://github.com/rauchg/wordledge"
                rel="noreferrer"
                target="_blank">
                Wordledge
              </a>
              . Tussen de 🥣 en de 🥔 gemaakt door{" "}
              <a href="https://broddin.be/" rel="noreferrer" target="_blank">
                Tim Broddin
              </a>
            </p>
          </Footer>
        </InnerWrapper>
      </Main>

      {isGameOver && !modalClosed ? (
        <Results
          WORD_LENGTH={WORD_LENGTH}
          gameState={gameState}
          solutions={solutions}
          close={() => setModalClosed(true)}
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
