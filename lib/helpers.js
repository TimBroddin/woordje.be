import copy from "copy-text-to-clipboard";
import { createSelector } from "@reduxjs/toolkit";
import { customGameResolver } from "@/lib/customGames";
import { request } from "graphql-request";
import { LOG_RESULT_MUTATION } from "../queries";
import woorden from "@/data/woorden.json";

export const getIsGameOverSelector = createSelector(
  (state) => state.settings,
  (state) => state.gameState,
  (settings, gameState) => {
    const { boardSize, wordLength, gameType } = settings;
    return gameState &&
      gameState.guesses[customGameResolver(gameType, wordLength)] &&
      (gameState.guesses[customGameResolver(gameType, wordLength)]?.length ===
        boardSize ||
        getIsVictory({
          guesses: gameState.guesses[customGameResolver(gameType, wordLength)],
        }))
      ? true
      : false;
  }
);

export const getIsVictorySelector = createSelector(
  (state) => state.settings,
  (state) => state.gameState,
  (settings, gameState) => {
    const { boardSize, wordLength, gameType } = settings;
    return gameState &&
      gameState.guesses[customGameResolver(gameType, wordLength)] &&
      getIsVictory({
        guesses: gameState.guesses[customGameResolver(gameType, wordLength)],
      })
      ? true
      : false;
  }
);

export const getStreak = createSelector(
  (state) => state.settings,
  (state) => state.gameState,
  (state) => state.statistics,
  (settings, gameState, statistics) => {
    const { wordLength, gameType } = settings;
    const { gameId } = gameState;

    if (!statistics || !gameId || !wordLength) return 0;

    let streak = 0;
    let bust = false;
    // start at game 10
    const relevant =
      statistics[customGameResolver(gameType, wordLength)]
        ?.slice(10, gameId + 1)
        .reverse() || [];
    for (let i = 0; i < relevant.length; i++) {
      if (relevant[i] > 0 && !bust) {
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
    const { wordLength, gameType } = settings;
    const { gameId } = gameState;
    if (!statistics || !gameId || !wordLength)
      return { wins: 0, loses: 0, distribution: {} };

    const relevant = statistics[customGameResolver(gameType, wordLength)]
      ? statistics[customGameResolver(gameType, wordLength)]?.slice(
          10,
          gameId + 1
        )
      : [];
    const wins = relevant.filter((item) => item > 0).length;
    const lost = relevant.filter((item) => item < 0).length;
    let distribution = {};
    let currentStreak = 0;
    const streaks = [];
    for (let i = 0; i < relevant.length; i++) {
      const val = relevant[i];
      if (val !== null) {
        distribution[val] = distribution[val] ? distribution[val] + 1 : 1;
      }
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
    return {
      wins,
      lost,
      relevant,
      biggestStreak: streaks.length ? Math.max(...streaks) : 0,
      distribution,
    };
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

export const gameIdToIndex = (gameId, locale) => {
  if (locale === "nl-BE") {
    return parseInt(gameId) + 1;
  } else {
    return parseInt(gameId) + 37;
  }
};

export const logResult = async (gameId, wordLength, gameType, tries) => {
  await request("/api/graphql", LOG_RESULT_MUTATION, {
    gameId,
    wordLength,
    gameType,
    tries,
  });
};

export const check = (text, solution) => {
  const wordLength = solution.length;
  if (text !== solution) {
    const matchingWords = woorden[wordLength].filter((w) => text === w);
    if (!matchingWords.length) {
      throw new Error("unknown word");
      return;
    }
  }

  const lettersToCheck = solution.split("");
  const letters = text.split("");
  const match = letters.map((letter) => ({
    letter: letter,
    score: "bad",
  }));
  for (let i = letters.length - 1; i >= 0; i--) {
    if (solution[i] === letters[i]) {
      match[i].score = "good";
      lettersToCheck.splice(i, 1);
    }
  }
  letters.forEach((letter, i) => {
    if (lettersToCheck.includes(letter) && match[i].score !== "good") {
      match[i].score = "off";
      lettersToCheck.splice(lettersToCheck.indexOf(letter), 1);
    }
  });
  return match;
};
