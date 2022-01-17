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
