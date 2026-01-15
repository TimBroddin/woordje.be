"use client";

import { useGameStore } from "@/lib/stores/game-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getTodaysGameId } from "@/lib/gameId";
import { useTranslations } from "@/lib/i18n/use-translations";

/**
 * Get current game state and setter for the current word length
 */
export const useGameState = () => {
  const { guesses, setGameState, gameId: storedGameId, resetGameState } = useGameStore();
  const { wordLength, gameType, gameId } = useSettingsStore();

  // Reset if game ID changed
  if (storedGameId !== gameId && gameId !== null) {
    resetGameState(gameId);
  }

  const currentGuesses = guesses[wordLength] || [];

  const setGameStateAction = ({ guesses: newGuesses }) => {
    if (gameId !== null) {
      setGameState({ gameId, wordLength, guesses: newGuesses });
    }
  };

  return [{ guesses: currentGuesses }, setGameStateAction];
};

/**
 * Get today's game ID
 */
export const useCurrentGameId = () => {
  return getTodaysGameId();
};

/**
 * Check if a game ID is from the archive (not today)
 */
export const useIsArchive = (gameId) => {
  return getTodaysGameId() !== gameId;
};

/**
 * Get display game ID adjusted for locale
 */
export const useDisplayGameId = (gameId = null) => {
  const translations = useTranslations();
  const id = gameId !== null ? gameId : getTodaysGameId();

  if (translations.id === "woordje") {
    return id;
  } else {
    return id - 36;
  }
};

/**
 * Get solution from SSR data context (for compatibility)
 * This is now handled via props in App Router, so this hook
 * returns a function that can be used with initial data
 */
export const useSolution = ({ gameId, wordLength }, initialData) => {
  // In App Router, solution is passed as a prop from server component
  // This is kept for backward compatibility
  return { solution: initialData, loading: false };
};

/**
 * Calculate streak from statistics
 */
export const useStreak = () => {
  const { data: statistics } = useStatisticsStore();
  const { wordLength, gameType, gameId } = useSettingsStore();
  const { gameId: storedGameId } = useGameStore();

  const currentGameId = gameId || storedGameId;

  if (!statistics || !currentGameId || !wordLength) return 0;

  const relevantStats = statistics[wordLength] || {};
  let streak = 0;
  let bust = false;

  // Start at game 10, go backwards from current game
  for (let i = currentGameId; i >= 10 && !bust; i--) {
    const result = relevantStats[i];
    if (result !== undefined && result > 0) {
      streak++;
    } else if (result !== undefined) {
      bust = true;
    }
  }

  return streak;
};

/**
 * Get aggregated statistics for the current word length
 */
export const useStatisticsData = () => {
  const { data: statistics } = useStatisticsStore();
  const { wordLength, gameType } = useSettingsStore();
  const { gameId } = useGameStore();

  if (!statistics || !gameId || !wordLength) {
    return { wins: 0, lost: 0, distribution: {}, biggestStreak: 0 };
  }

  const relevantStats = statistics[wordLength] || {};
  const relevantEntries = Object.entries(relevantStats).filter(
    ([id]) => parseInt(id) >= 10 && parseInt(id) <= gameId
  );

  const wins = relevantEntries.filter(([_, val]) => val > 0).length;
  const lost = relevantEntries.filter(([_, val]) => val < 0).length;

  const distribution = {};
  let currentStreak = 0;
  const streaks = [];

  // Build distribution and streaks
  for (let i = 10; i <= gameId; i++) {
    const val = relevantStats[i];
    if (val !== undefined) {
      distribution[val] = (distribution[val] || 0) + 1;
      if (val > 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
        }
        currentStreak = 0;
      }
    }
  }

  if (currentStreak > 0) {
    streaks.push(currentStreak);
  }

  return {
    wins,
    lost,
    biggestStreak: streaks.length ? Math.max(...streaks) : 0,
    distribution,
  };
};

/**
 * Check if game is over
 */
export const useIsGameOver = () => {
  const { guesses } = useGameStore();
  const { wordLength, boardSize } = useSettingsStore();

  const currentGuesses = guesses[wordLength] || [];

  if (currentGuesses.length === 0) return false;
  if (currentGuesses.length >= boardSize) return true;

  // Check if won
  const lastGuess = currentGuesses[currentGuesses.length - 1];
  return !lastGuess.some((i) => i.score !== "good");
};

/**
 * Check if player won
 */
export const useIsVictory = () => {
  const { guesses } = useGameStore();
  const { wordLength } = useSettingsStore();

  const currentGuesses = guesses[wordLength] || [];

  if (currentGuesses.length === 0) return false;

  const lastGuess = currentGuesses[currentGuesses.length - 1];
  return !lastGuess.some((i) => i.score !== "good");
};
