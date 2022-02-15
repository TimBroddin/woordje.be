import { useSelector, useDispatch } from "react-redux";

import { getGameId } from "./gameId";
import { customGameResolver } from "./customGames";
import { resetGameState, setGameState } from "../redux/features/gameState";
import { useTranslations } from "./i18n";

const useGameState = () => {
  const dispatch = useDispatch();

  const { WORD_LENGTH, gameType } = useSelector((state) => state.settings);
  const gameId = getGameId();

  const currentGameState = useSelector((state) => state.gameState);
  if (currentGameState.gameId !== getGameId()) {
    dispatch(resetGameState(getGameId()));
  }

  const guesses = useSelector((state) => {
    return state.gameState.guesses[
      customGameResolver(state.settings.gameType, WORD_LENGTH)
    ];
  });

  const setGameStateAction = (gameState) => {
    dispatch(
      setGameState({
        gameId,
        WORD_LENGTH,
        gameType,
        guesses: gameState.guesses,
      })
    );
  };
  return [guesses ? { guesses } : { guesses: [] }, setGameStateAction];
};

const useCorrectedGameId = () => {
  const translations = useTranslations();
  if (translations.id === "woordje") {
    return getGameId() - 1;
  } else if (translations.id === "woordol") {
    return getGameId() - 37;
  }
};

export { useGameState, useCorrectedGameId };
