import copy from "copy-text-to-clipboard";

export function getIsGameOver(gameState) {
  return gameState && (gameState.state.length === 6 || getIsVictory(gameState));
}

export function getIsVictory(gameState) {
  return (
    gameState &&
    gameState.state.length &&
    !gameState.state[gameState.state.length - 1].some((i) => i.score !== "good")
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
