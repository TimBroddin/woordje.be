"use server";

import woorden from "@/data/woorden.json";
import { getTodaysGameId } from "@/lib/gameId";
import { scoreGuess } from "@/lib/score";

export async function checkWord(text, gameId, wordLength) {
  // Validate game ID (prevent future game guessing)
  if (gameId > getTodaysGameId()) {
    return { error: "invalid_game" };
  }

  const parsedWordLength = parseInt(wordLength);
  const wordList = woorden[parsedWordLength];
  const wrappedGameId = gameId % wordList.length;
  const word = wordList[wrappedGameId];

  // Validate word exists in dictionary
  if (word !== text) {
    const matchingWords = wordList.filter((w) => text === w);
    if (!matchingWords.length) {
      return { error: "unknown_word" };
    }
  }

  return { match: scoreGuess(word, text) };
}
