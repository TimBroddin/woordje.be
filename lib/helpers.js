import copy from "copy-text-to-clipboard";
import { useGameState } from "./hooks";
import { getGameId } from "./gameId";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";

export function useIsGameOver() {
  const [gameState] = useGameState();
  const { BOARD_SIZE } = useSelector((state) => state.settings);
  return (
    gameState &&
    (gameState.guesses?.length === BOARD_SIZE || getIsVictory(gameState))
  );
}

export const getIsGameOver = createSelector(
  (state) => state.settings,
  (state) => state.gameState,
  (settings, gameState) => {
    const { BOARD_SIZE, WORD_LENGTH } = settings;
    return gameState &&
      gameState.guesses[WORD_LENGTH] &&
      (gameState.guesses[WORD_LENGTH]?.length === BOARD_SIZE ||
        getIsVictory({ guesses: gameState.guesses[WORD_LENGTH] }))
      ? true
      : false;
  }
);

export const getStreak = createSelector(
  (state) => state.settings,
  (state) => state.gameState,
  (state) => state.statistics,
  (settings, gameState, statistics) => {
    const { WORD_LENGTH } = settings;
    const { gameId } = gameState;

    if (!statistics || !gameId || !WORD_LENGTH) return 0;

    let streak = 0;
    let bust = false;
    // start at game 10
    const relevant = statistics[WORD_LENGTH].slice(10, gameId + 1).reverse();
    for (let i = 0; i < relevant.length; i++) {
      if (relevant[i] && !bust) {
        streak++;
      } else {
        bust = true;
      }
    }
    return streak;
  }
);

export const getStatistics = createSelector(
  (state) => state.settings,
  (state) => state.gameState,
  (state) => state.statistics,
  (settings, gameState, statistics) => {
    const { WORD_LENGTH } = settings;
    const { gameId } = gameState;
    if (!statistics || !gameId || !WORD_LENGTH)
      return { wins: 0, loses: 0, distribution: {} };

    const relevant = statistics[WORD_LENGTH]
      ? statistics[WORD_LENGTH].slice(10, gameId + 1)
      : [];
    const wins = relevant.filter((item) => item > 0).length;
    const lost = relevant.filter((item) => item < 0).length;
    let distribution = {};
    let currentStreak = 0;
    const streaks = [];
    console.log(relevant);
    for (let i = 0; i < relevant.length; i++) {
      const val = relevant[i];
      console.log(val);
      distribution[val] = distribution[val] ? distribution[val]++ : 1;

      if (val > 0) {
        currentStreak++;
      } else {
        streaks.push(currentStreak);
        currentStreak = 0;
      }
    }
    if (currentStreak) {
      streaks.push(currentStreak);
    }
    console.log(streaks);
    return {
      wins,
      lost,
      relevant,
      biggestStreak: Math.max(...streaks),
      distribution,
    };
  }
);

export const getAllStatistics = createSelector(
  (state) => state.gameState,
  (state) => state.statistics,
  (gameState, statistics) => {
    //console.log(gameState, statistics);
    let allStatistics = {};
    for (let WORD_LENGTH = 3; WORD_LENGTH < 9; WORD_LENGTH++) {
      allStatistics[WORD_LENGTH] = getStatistics({
        settings: { WORD_LENGTH },
        gameState,
        statistics,
      });
    }
    return allStatistics;
  }
);

export function getIsVictory(gameState) {
  return (
    gameState &&
    gameState.guesses?.length &&
    !gameState.guesses[gameState.guesses.length - 1].some(
      (i) => i.score !== "good"
    )
  );
}

export async function copyToClipboard(obj) {
  if (navigator.clipboard && "undefined" !== typeof ClipboardItem) {
    const item = new ClipboardItem({
      ["text/plain"]: new Blob([obj["text/plain"]], { type: "text/plain" }),
      ["text/html"]: new Blob([obj["text/html"]], { type: "text/html" }),
    });
    try {
      await navigator.clipboard.write([item]);
    } catch (err) {
      console.error("clipboard write error", err);
      return false;
    }
    return true;
  } else {
    return copy(obj["text/plain"]);
  }
}
