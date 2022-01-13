import { getGameId } from "./gameId";

export function readGameStateFromStorage(WORD_LENGTH) {
  let state = [];
  const GAME_ID = getGameId();
  console.log(`loading ${GAME_ID}-${WORD_LENGTH}`);
  try {
    const storedState = JSON.parse(
      localStorage.getItem(`gameState-${GAME_ID}-${WORD_LENGTH}`)
    );
    if (storedState) {
      if (storedState.gameId === GAME_ID) {
        state = storedState.state;
      }
    }
  } catch (err) {
    console.error("state restore error", err);
    localStorage.removeItem(`gameState-${GAME_ID}-${WORD_LENGTH}`);
  }
  return state;
}

export function saveGameStateToStorage(state, WORD_LENGTH) {
  const GAME_ID = getGameId();

  console.log(`saving ${GAME_ID}-${WORD_LENGTH}`);

  try {
    localStorage.setItem(
      `gameState-${GAME_ID}-${WORD_LENGTH}`,
      JSON.stringify({
        gameId: GAME_ID,
        state: state,
      })
    );
  } catch (err) {
    console.error("state save error", err);
  }
}
