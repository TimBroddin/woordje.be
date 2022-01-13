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
} from "../../lib/state";
import {
  copyToClipboard,
  getIsVictory,
  getIsGameOver,
} from "../../lib/helpers";

import {
  Main,
  ModalWrapper,
  Summary,
  ShareText,
  Board,
  Row,
  Letter,
  Footer,
  Random,
  HiddenInput,
  CloseModal,
} from "../../components/styled";

async function check(word, WORD_LENGTH, opts) {
  const res = await fetch(
    `/check?word=${encodeURIComponent(word)}&l=${WORD_LENGTH}`,
    opts
  );
  return await res.json();
}

async function getRandomword(length) {
  const res = await fetch(`/random?l=${length}`);
  return await res.text();
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
  const { width, height } = useWindowSize();
  const isGameOver = getIsGameOver(gameState, BOARD_SIZE);
  const plausible = usePlausible();

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

  function onClick(ev) {
    ev.preventDefault();

    setGameState((gameState) => {
      if (gameState) {
        if (!getIsGameOver(gameState)) {
          if (
            hiddenInputRef.current &&
            hiddenInputRef.current != document.activeElement
          ) {
            hiddenInputRef.current.focus();
          }
        }
      }
      return gameState;
    });
  }

  function onInputFocus() {
    setIsFocused(true);
  }

  function onInputBlur() {
    setIsFocused(false);
  }

  function getShareText(gameState, html = false) {
    const text = `${
      html ? '<a href="https://woordje.be">Woordje.be</a>' : "woordje.be"
    } #${CORRECTED_GAME_ID} ${
      WORD_LENGTH !== 6 ? `(${WORD_LENGTH} tekens)` : ""
    } ${getIsVictory(gameState) ? gameState.state.length : "X"}/${BOARD_SIZE}

${gameState.state
  .map((line) => {
    return line
      .map((item) => {
        return item.score === "good"
          ? "🟩"
          : item.score === "off"
          ? "🟨"
          : "⬛️";
      })
      .join("");
  })
  .join("\n")}`;
    if (html) {
      return text.replace(/\n/g, "<br>");
    } else {
      return text;
    }
  }

  function getEncodedState(gameState) {
    return gameState.state
      .map((line) =>
        line
          .map((item) =>
            item.score === "good" ? "V" : item.score === "off" ? "X" : "0"
          )
          .join("")
      )
      .join("");
  }

  function onCopyToClipboard(e) {
    e.stopPropagation();
    e.preventDefault();
    setGameState((gameState) => {
      if (gameState) {
        copyToClipboard({
          "text/plain": getShareText(gameState),
          "text/html": getShareText(gameState, true),
        }).then((ok) => {
          if (ok) {
            toast.success("Gekopieerd!", { id: "clipboard" });
          } else {
            toast.error("Clipboard error", { id: "clipboard" });
          }
        });
      }
      return gameState;
    });
  }

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

      hiddenInputRef.current.value = "";
      setInputText("");

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
      setGameState((state) => {
        return {
          state: state.state.concat([match]),
          initial: false,
        };
      });
    }
  }

  useEffect(() => {
    function handleKeyDown(ev) {
      if (fetchControllerRef.current || isGameOver) return;
      if (ev.metaKey || ev.altKey || ev.ctrlKey) return;
      hiddenInputRef.current.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameOver]);

  function onInput(ev) {
    const nativeEvent = ev.nativeEvent;
    setGameState((gameState) => {
      if (gameState && !getIsGameOver(gameState)) {
        const val = nativeEvent.target.value
          .toLowerCase()
          .replace(/[^a-z]+/g, "")
          .slice(0, WORD_LENGTH);
        setInputText(() => {
          nativeEvent.target.value = val;
          return val;
        });
      }
      return gameState;
    });
  }

  function onSubmit(ev) {
    ev.preventDefault();
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
      <Main $initializing={!gameState} onClick={onClick}>
        <form onSubmit={onSubmit}>
          <HiddenInput
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            ref={hiddenInputRef}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            enterKeyHint="go"
            onInput={onInput}
          />
        </form>

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

          <h1>Credits</h1>
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
      </Main>

      {isGameOver && !modalClosed ? (
        <ModalWrapper>
          <Summary>
            <CloseModal
              href="#close"
              onClick={(e) => {
                e.preventDefault();
                setModalClosed(true);
              }}>
              X
            </CloseModal>
            <h1>Samenvatting</h1>
            <ShareText onClick={(e) => e.stopPropagation()}>
              {getShareText(gameState)}
            </ShareText>

            <button onClick={onCopyToClipboard}>📋 Kopieer</button>
            <h2>Deel score</h2>
            <div className="button">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  getShareText(gameState)
                )}`}
                rel="noreferrer"
                target="_blank"
                className="share">
                🐦 Twitter
              </a>
            </div>
            <div className="button">
              <a
                href={`https://www.facebook.com/share.php?u=${encodeURIComponent(
                  `https://www.woordje.be/share/${WORD_LENGTH}/${getEncodedState(
                    gameState
                  )}`
                )}`}
                rel="noreferrer"
                target="_blank"
                className="share">
                👍 Facebook
              </a>
            </div>
            <div className="button">
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  `https://www.woordje.be/share/${WORD_LENGTH}/${getEncodedState(
                    gameState
                  )}`
                )}`}
                rel="noreferrer"
                target="_blank"
                className="share">
                🤵 LinkedIn
              </a>
            </div>

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
          </Summary>
        </ModalWrapper>
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
