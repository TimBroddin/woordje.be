import copy from "copy-text-to-clipboard";
import { logResult as logResultAction } from "@/lib/actions/log-result";

/**
 * Check if the game state represents a victory
 */
export function getIsVictory(gameState) {
  return (
    gameState &&
    gameState.guesses?.length &&
    !gameState.guesses[gameState.guesses.length - 1].some(
      (i) => i.score !== "good"
    )
  );
}

/**
 * Copy text to clipboard with HTML support
 */
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

/**
 * Convert game ID to index based on locale
 */
export const gameIdToIndex = (gameId, locale) => {
  if (locale === "nl-BE") {
    return parseInt(gameId) + 1;
  } else {
    return parseInt(gameId) + 37;
  }
};

/**
 * Log game result to server using server action
 */
export const logResult = async (gameId, wordLength, gameType, tries) => {
  return logResultAction(gameId, wordLength, gameType, tries);
};

/**
 * Calculate streak from statistics store data
 * @param {Object} statistics - Statistics data keyed by wordLength then gameId
 * @param {number} wordLength - Current word length
 * @param {number} gameId - Current game ID
 */
export function calculateStreak(statistics, wordLength, gameId) {
  if (!statistics || !gameId || !wordLength) return 0;

  const relevantStats = statistics[wordLength] || {};
  let streak = 0;
  let bust = false;

  // Start from current game, go backwards
  for (let i = gameId; i >= 10 && !bust; i--) {
    const result = relevantStats[i];
    if (result !== undefined && result > 0) {
      streak++;
    } else if (result !== undefined) {
      bust = true;
    }
  }

  return streak;
}

/**
 * Calculate aggregated statistics
 * @param {Object} statistics - Statistics data keyed by wordLength then gameId
 * @param {number} wordLength - Current word length
 * @param {number} gameId - Current game ID
 */
export function calculateStatistics(statistics, wordLength, gameId) {
  if (!statistics || !gameId || !wordLength) {
    return { wins: 0, lost: 0, distribution: {}, biggestStreak: 0 };
  }

  const relevantStats = statistics[wordLength] || {};
  const distribution = {};
  let wins = 0;
  let lost = 0;
  let currentStreak = 0;
  const streaks = [];

  // Build distribution and streaks
  for (let i = 10; i <= gameId; i++) {
    const val = relevantStats[i];
    if (val !== undefined) {
      distribution[val] = (distribution[val] || 0) + 1;
      if (val > 0) {
        wins++;
        currentStreak++;
      } else {
        lost++;
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
}
