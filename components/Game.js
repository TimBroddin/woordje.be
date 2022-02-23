import { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import toast, { Toaster } from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { usePlausible } from "next-plausible";

// HELPERS & HOOKS
import { getIsGameOverSelector } from "@/lib/helpers";

import { useGameState } from "@/lib/hooks";

// REDUX
import { setSettings } from "@/redux/features/settings";
import { getRandomWord, setRandomWord } from "@/redux/features/randomWord";
import { addWin, addLoss } from "@/redux/features/statistics";
import { setInputText } from "@/redux/features/inputText";
import { stop as stopTimer, reset as resetTimer } from "@/redux/features/timer";
import { setModal } from "@/redux/features/modal";

// COMPONENTS
import { Board, Row } from "@/components/styled";
import Letter from "@/components/Letter";
import Keyboard from "@/components/Keyboard";
import Results from "@/components/Results";
import Splash from "@/components/Splash";
import Statistics from "@/components/Statistics";
import AddToHomeScreen from "@/components/AddToHomeScreen";

const STAGGER = 0.15;

async function check(word, gameType, wordLength, gameId, locale, opts) {
  const res = await fetch(
    `/api/check?word=${encodeURIComponent(word)}&l=${
      gameType === "vrttaal" ? gameType : wordLength
    }&gameId=${gameId}&locale=${locale}`,
    opts
  );
  return await res.json();
}

async function getSolution(l, gameId, locale) {
  const res = await fetch(
    `/api/solution?l=${l}&gameId=${gameId}&locale=${locale}`
  );
  return await res.json();
}

export default function Game({
  gameId,
  gameType,
  wordLength,
  ssrSolution,
  ssrRandomWord,
  ssrDemoWords,
}) {
  const dispatch = useDispatch();
  const { locale } = useRouter();
  const boardSize = wordLength + 1;

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
  const { colorBlind, hardMode } = useSelector((state) => state.settings);
  const plausible = usePlausible();

  useEffect(() => {
    getSolution(
      gameType === "vrttaal" ? "vrttaal" : wordLength,
      gameId,
      locale
    ).then((solution) => setSolution(solution));
  }, [wordLength, gameType, locale, gameId]);

  useEffect(() => {
    setShowConfetti(false);
    dispatch(setSettings({ wordLength, boardSize, gameType, gameId }));
    dispatch(resetTimer());
    dispatch(setInputText(""));
  }, [gameId, wordLength, gameType, boardSize, dispatch]);

  useEffect(() => {
    if (currentModal && !isGameOver && currentModal === "results") {
      //dispatch(hideModal());
    }
  }, [currentModal, dispatch, gameType, isGameOver]);

  useEffect(() => {
    if (isGameOver) {
      getSolution(
        gameType === "vrttaal" ? "vrttaal" : wordLength,
        gameId,
        locale
      ).then((solution) => setSolution(solution));
      setTimeout(() => {
        dispatch(setModal("results"));
      }, wordLength * STAGGER * 1000);
    }
  }, [dispatch, isGameOver, locale, wordLength, gameType, gameId]);

  useEffect(() => {
    dispatch(resetTimer());
  }, [gameId, dispatch]);

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
      // check if all previous guessed letters are used
      if (hardMode) {
        const neededLetters = [
          ...new Set(
            [].concat.apply(
              [],
              gameState.guesses.map((guess) =>
                guess
                  .filter((l) => l.score === "good" || l.score === "off")
                  .map((l) => l.letter)
              )
            )
          ),
        ];

        if (neededLetters.length) {
          const leftOver = neededLetters.filter(
            (l) => text.split("").indexOf(l) === -1
          );
          if (leftOver.length) {
            toast.error(
              "Je moet alle letters die je al hebt geraden gebruiken.",
              { id: "toast", duration: 2000 }
            );
            fetchControllerRef.current = null;
            setIsLoading(false);

            return;
          }
        }
      }

      toast.loading("Controleren...", { id: "toast", duration: Infinity });
      if (text === randomWord.value) {
        dispatch(getRandomWord());
      }

      let serverResponse;
      try {
        serverResponse = await check(
          text,
          gameType,
          wordLength,
          gameId,
          locale,
          {
            signal: controller.signal,
          }
        );
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
          toast.error("Ongeldig woord", { id: "toast", duration: 2000 });
        }
      } else {
        toast.dismiss("toast");

        dispatch(setInputText(""));
        if (!match.some((i) => i.score !== "good")) {
          setShowConfetti(true);
          plausible("win", {
            props: {
              length: wordLength,
              tries: `${gameState.guesses.length + 1}/${boardSize}`,
              game: `${gameId}x${wordLength}`,
            },
          });
          dispatch(stopTimer());
          dispatch(
            addWin({
              gameId,
              wordLength,
              gameType,
              guesses: gameState.guesses.length + 1,
            })
          );

          // increment streak
        } else if (gameState.guesses.length + 1 === boardSize) {
          dispatch(stopTimer());

          plausible("lose", {
            props: {
              length: wordLength,
              game: `${gameId}x${wordLength}`,
            },
          });
          console.log({ gameId, gameType, wordLength });
          dispatch(addLoss({ gameId, gameType, wordLength }));
        }

        setGameState({
          gameId,
          wordLength,
          guesses: gameState.guesses.concat([match]),
        });
      }
    },
    [
      boardSize,
      wordLength,
      gameId,
      gameState.guesses,
      plausible,
      randomWord,
      setGameState,
      dispatch,
      gameType,
      hardMode,
      locale,
    ]
  );

  const onSubmit = useCallback(() => {
    if (gameState && !isGameOver) {
      if (!fetchControllerRef.current && inputText.length === wordLength) {
        submit(inputText);
      }
    }
  }, [
    inputText,
    wordLength,
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

  return (
    <>
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

      <Board
        loading={isLoading}
        style={{ "--word-length": wordLength, "--shrink-size": "4px" }}>
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
                    radius={letterBorderRadius(i, boardSize, k, wordLength)}
                    score={item.score}>
                    {item.letter}
                  </Letter>
                );
              })}
            </Row>
          ))}

        {gameState && gameState.guesses.length < boardSize
          ? Array.from(
              { length: boardSize - gameState.guesses.length },
              (_, i) => {
                const idx = gameState.guesses
                  ? gameState.guesses.length + i
                  : i;
                if (i === 0 && !isGameOver) {
                  return (
                    <Row key={`gs_row${idx}`}>
                      {inputText
                        .padEnd(wordLength, "?")
                        .split("")
                        .map((letter, index) => (
                          <Letter
                            focus={
                              index ===
                              Math.min(
                                Math.max(0, inputText.length),
                                wordLength - 1
                              )
                            }
                            key={`letter-${i}-${index}`}
                            radius={letterBorderRadius(
                              idx,
                              boardSize,
                              index,
                              wordLength
                            )}>
                            {letter === "?" ? null : letter}
                          </Letter>
                        ))}
                    </Row>
                  );
                } else {
                  return (
                    <Row key={`row_${i}`}>
                      {Array.from({ length: wordLength }, (_, j) => (
                        <Letter
                          disabled={true}
                          key={`disabled-${i}-${j}`}
                          radius={letterBorderRadius(
                            idx,
                            boardSize,
                            j,
                            wordLength
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
                .slice(0, wordLength)
            )
          );
        }}
        onBackspace={() => {
          dispatch(setInputText(inputText.slice(0, -1)));
        }}
        onSubmit={onSubmit}
      />

      <Splash visible={currentModal === "splash"} words={ssrDemoWords} />
      <Statistics visible={currentModal === "statistics"} />
      <Results
        visible={currentModal === "results" && isGameOver}
        solution={solution}
        toast={toast}
      />
    </>
  );
}
