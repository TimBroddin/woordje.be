"use server";

import woorden from "@/data/woorden.json";
import { getTodaysGameId } from "@/lib/gameId";

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

  // Calculate letter scores
  const lettersToCheck = word.split("");
  const letters = text.split("");
  const match = letters.map((letter) => ({
    letter: letter,
    score: "bad",
  }));

  // First pass: find exact matches (green)
  for (let i = letters.length - 1; i >= 0; i--) {
    if (word[i] === letters[i]) {
      match[i].score = "good";
      lettersToCheck.splice(i, 1);
    }
  }

  // Second pass: find partial matches (yellow)
  letters.forEach((letter, i) => {
    if (lettersToCheck.includes(letter) && match[i].score !== "good") {
      match[i].score = "off";
      lettersToCheck.splice(lettersToCheck.indexOf(letter), 1);
    }
  });

  return { match };
}
