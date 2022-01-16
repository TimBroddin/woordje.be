import copy from "copy-text-to-clipboard";
import { useGameState } from "./hooks";
import { getGameId } from "./gameId";
import { useSelector } from "react-redux";

export function useIsGameOver() {
  const [gameState] = useGameState();
  const { BOARD_SIZE } = useSelector((state) => state.settings);
  return (
    gameState &&
    (gameState.guesses?.length === BOARD_SIZE || getIsVictory(gameState))
  );
}

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
