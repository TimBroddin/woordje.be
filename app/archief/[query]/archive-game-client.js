"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { usePlausible } from "next-plausible";

// Server action
import { checkWord } from "@/lib/actions/check";
import { logResult } from "@/lib/actions/log-result";

// Zustand stores
import { useGameStore } from "@/lib/stores/game-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useUIStore } from "@/lib/stores/ui-store";

import { useTranslations } from "@/lib/i18n/use-translations";

// Components
import { Main, Board, Row } from "@/components/styled";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Letter from "@/components/Letter";
import Keyboard from "@/components/Keyboard";
import Results from "@/components/Results";
import Splash from "@/components/Splash";
import Statistics from "@/components/Statistics";
import AddToHomeScreen from "@/components/AddToHomeScreen";

const STAGGER = 0.15;

export default function ArchiveGameClient({
  displayGameId,
  wordLength,
  gameType,
  ssr,
}) {
  const boardSize = wordLength + 1;
  const { width, height } = useWindowSize();
  const plausible = usePlausible();
  const fetchControllerRef = useRef(null);
  // Auto-detect locale from hostname (no override)
  const translations = useTranslations();

  // Calculate gameId based on locale (woordol uses +36 offset)
  const gameId = translations.id === "woordol" ? displayGameId + 36 : displayGameId;

  // Zustand stores
  const { guesses, setGameState, resetGameState, gameId: storedGameId } = useGameStore();
  const { colorBlind, hardMode, setSettings } = useSettingsStore();
  const { addWin, addLoss } = useStatisticsStore();
  const {
    inputText,
    setInputText,
    currentModal,
    setModal,
    randomWord,
    setRandomWord,
    resetTimer,
    stopTimer,
    gameStats,
    setGameStats,
  } = useUIStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get current guesses for this word length
  const currentGuesses = guesses[wordLength] || [];

  // Calculate game state
  const isVictory =
    currentGuesses.length > 0 &&
    !currentGuesses[currentGuesses.length - 1].some((i) => i.score !== "good");
  const isGameOver = currentGuesses.length === boardSize || isVictory;

  // Initialize stores with SSR data on mount and when game changes
  useEffect(() => {
    if (storedGameId !== gameId) {
      resetGameState(gameId);
      resetTimer();
      setInputText("");
    }

    setShowConfetti(false);
    setSettings({ wordLength, boardSize, gameType, gameId });
    setRandomWord(ssr.randomWord);
    setGameStats(ssr.statistics);
  }, [
    gameId,
    wordLength,
    gameType,
    boardSize,
    ssr,
    storedGameId,
    resetGameState,
    setSettings,
    resetTimer,
    setInputText,
    setRandomWord,
    setGameStats,
  ]);

  // Handle colorblind mode
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (colorBlind) {
        document.body.classList.add("colorblind");
      } else {
        document.body.classList.remove("colorblind");
      }
    }
  }, [colorBlind]);

  // Show results modal when game is over
  useEffect(() => {
    if (isGameOver) {
      setTimeout(() => {
        setModal("results");
      }, wordLength * STAGGER * 1000);
    }
  }, [isGameOver, wordLength, setModal]);

  // Cancel pending fetch on input change
  useEffect(() => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    toast.dismiss("toast");
  }, [inputText]);

  // Submit guess using server action
  const submit = useCallback(
    async (text) => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      const controller = new AbortController();
      fetchControllerRef.current = controller;

      setIsLoading(true);

      // Hard mode validation
      if (hardMode && currentGuesses.length > 0) {
        const neededLetters = [
          ...new Set(
            [].concat.apply(
              [],
              currentGuesses.map((guess) =>
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

      if (text === randomWord) {
        setRandomWord("");
      }

      try {
        const result = await checkWord(text, gameId, wordLength);

        setIsLoading(false);
        fetchControllerRef.current = null;

        if (result.error) {
          if (result.error === "unknown_word") {
            toast.error("Ongeldig woord", { id: "toast", duration: 2000 });
          } else {
            toast.error("Er is een fout opgetreden", { id: "toast", duration: 2000 });
          }
          return;
        }

        toast.dismiss("toast");
        setInputText("");

        const match = result.match;
        const newGuesses = [...currentGuesses, match];
        const won = !match.some((i) => i.score !== "good");

        if (won) {
          setShowConfetti(true);
          stopTimer();
          addWin({ gameId, wordLength, gameType, guesses: newGuesses.length });

          logResult(gameId, wordLength, "normal", newGuesses.length).then(
            (result) => {
              if (result.statistics) {
                setGameStats(result.statistics);
              }
            }
          );
        } else if (newGuesses.length === boardSize) {
          stopTimer();
          addLoss({ gameId, wordLength, gameType });

          logResult(gameId, wordLength, "normal", newGuesses.length + 1).then(
            (result) => {
              if (result.statistics) {
                setGameStats(result.statistics);
              }
            }
          );
        }

        setGameState({ gameId, wordLength, guesses: newGuesses });
      } catch (err) {
        setIsLoading(false);
        fetchControllerRef.current = null;

        if (err.name === "AbortError") {
          toast.dismiss("toast");
        } else {
          toast.error("Er is een fout opgetreden", { id: "toast" });
        }
      }
    },
    [
      gameId,
      wordLength,
      boardSize,
      currentGuesses,
      hardMode,
      randomWord,
      addWin,
      addLoss,
      setGameState,
      setInputText,
      setRandomWord,
      stopTimer,
      setGameStats,
      gameType,
    ]
  );

  const onSubmit = useCallback(() => {
    if (!isGameOver && !fetchControllerRef.current && inputText.length === wordLength) {
      submit(inputText);
    }
  }, [inputText, wordLength, isGameOver, submit]);

  const letterBorderRadius = (rowIndex, totalRows, letterIndex, totalLetters) => {
    const borderRadius = "7px";
    if (rowIndex === 0 && letterIndex === 0) {
      return { borderTopLeftRadius: borderRadius };
    }
    if (rowIndex === 0 && letterIndex === totalLetters - 1) {
      return { borderTopRightRadius: borderRadius };
    }
    if (rowIndex === totalRows - 1 && letterIndex === 0) {
      return { borderBottomLeftRadius: borderRadius };
    }
    if (rowIndex === totalRows - 1 && letterIndex === totalLetters - 1) {
      return { borderBottomRightRadius: borderRadius };
    }
  };

  const row = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: STAGGER,
      },
    },
  };

  return (
    <Main>
      <Header
        customTitle="Archief"
        subtitle={`${translations.title} #${displayGameId} x ${wordLength}`}
      />

      <Toaster />
      <AddToHomeScreen />

      {showConfetti && (
        <Confetti
          numberOfPieces={300}
          recycle={false}
          width={width}
          height={height}
          initialVelocityY={-25}
        />
      )}

      <Board
        loading={isLoading}
        style={{ "--word-length": wordLength, "--shrink-size": "4px" }}
      >
        {currentGuesses.map((match, i) => (
          <Row
            key={`gs_row${i}`}
            variants={row}
            initial={i === currentGuesses.length - 1 ? "hidden" : "show"}
            animate="show"
          >
            {match.map((item, k) => (
              <Letter
                key={`letter-${k}`}
                radius={letterBorderRadius(i, boardSize, k, wordLength)}
                score={item.score}
              >
                {item.letter}
              </Letter>
            ))}
          </Row>
        ))}

        {currentGuesses.length < boardSize &&
          Array.from(
            { length: boardSize - currentGuesses.length },
            (_, i) => {
              const idx = currentGuesses.length + i;
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
                          )}
                        >
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
                        radius={letterBorderRadius(idx, boardSize, j, wordLength)}
                      />
                    ))}
                  </Row>
                );
              }
            }
          )}
      </Board>

      <Keyboard
        onPress={(l) => {
          setInputText(
            `${inputText}${l}`
              .toLowerCase()
              .replace(/[^a-z]+/g, "")
              .slice(0, wordLength)
          );
        }}
        onBackspace={() => {
          setInputText(inputText.slice(0, -1));
        }}
        onSubmit={onSubmit}
      />

      <Splash visible={currentModal === "splash"} demoWords={ssr.demoWords} />
      <Statistics visible={currentModal === "statistics"} />
      <Results visible={currentModal === "results" && isGameOver} toast={toast} solution={ssr.solution} />

      <Footer gameId={gameId} wordLength={wordLength} boardSize={boardSize} />
    </Main>
  );
}
