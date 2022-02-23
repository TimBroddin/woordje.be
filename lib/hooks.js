import { useSelector, useDispatch } from "react-redux";

import { getTodaysGameId } from "@/lib/gameId";
import { customGameResolver } from "@/lib/customGames";
import { resetGameState, setGameState } from "@/redux/features/gameState";
import { useTranslations } from "@/lib/i18n";

const useGameState = () => {
  const dispatch = useDispatch();
  const { wordLength, gameType, gameId } = useSelector(
    (state) => state.settings
  );

  const currentGameState = useSelector((state) => state.gameState);
  if (currentGameState.gameId !== gameId) {
    dispatch(resetGameState(gameId));
  }

  const guesses = useSelector((state) => {
    return state.gameState.guesses[
      customGameResolver(state.settings.gameType, wordLength)
    ];
  });

  const setGameStateAction = (gameState) => {
    dispatch(
      setGameState({
        gameId,
        wordLength,
        gameType,
        guesses: gameState.guesses,
      })
    );
  };
  return [guesses ? { guesses } : { guesses: [] }, setGameStateAction];
};

const useCorrectedGameId = (gameId = false) => {
  const translations = useTranslations();
  const id = gameId ? gameId : getTodaysGameId();
  if (translations.id === "woordje") {
    return id;
  } else if (translations.id === "woordol") {
    return id - 36;
  }
};

const useInternalGameId = (gameId) => {
  const translations = useTranslations();
  if (translations.id === "woordje") {
    return gameId + 1;
  } else {
    return gameId + 37;
  }
};

export { useGameState, useCorrectedGameId, useInternalGameId };
