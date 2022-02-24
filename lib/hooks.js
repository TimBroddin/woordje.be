import { useContext } from "react";
import { useSelector, useDispatch } from "react-redux";

import { SsrContext } from "@/lib/context/SSRContext";
import { getTodaysGameId } from "@/lib/gameId";
import { customGameResolver } from "@/lib/customGames";
import { resetGameState, setGameState } from "@/redux/features/gameState";
import { useTranslations } from "@/lib/i18n";
import useSwr from "swr";
import { SOLUTION_QUERY, STATS_QUERY } from "../queries";
import { initial } from "lodash";

export const useGameState = () => {
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

export const useCurrentGameId = () => {
  return getTodaysGameId();
};

export const useIsArchive = (gameId) => {
  return useCurrentGameId() !== gameId;
};

export const useDisplayGameId = (gameId = false) => {
  const translations = useTranslations();
  const id = gameId ? gameId : getTodaysGameId();
  if (translations.id === "woordje") {
    return id;
  } else if (translations.id === "woordol") {
    return id - 36;
  }
};

export const useSolution = (
  { gameId, wordLength, customGame },
  initialData
) => {
  const { data, loading } = useSwr(
    {
      query: SOLUTION_QUERY,
      variables: {
        gameId,
        wordLength,
        customGame,
      },
    },
    null,
    { fallbackData: { solution: initialData } }
  );
  return { solution: data?.solution, loading };
};

export const useRandomWords = (amount, wordLength) => {
  const { data, loading } = useSwr({
    query: RANDOM_WORD_QUERY,
    variables: {
      amount,
      wordLength,
    },
  });

  return { words: data?.randomWords, loading };
};

export const useStats = ({ gameId, wordLength, gameType }, initialData) => {
  const { data, loading } = useSwr(
    {
      query: STATS_QUERY,
      variables: {
        gameId,
        wordLength,
        gameType: gameType === "vrttaal" ? "vrttaal" : "normal",
      },
    },
    null,
    {
      fallbackData: { stats: initialData },
    }
  );

  return { stats: data?.stats, loading };
};

export const useSsr = () => {
  return useContext(SsrContext);
};
