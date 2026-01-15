import woorden from "@/data/woorden.json";
import { getTodaysGameId } from "@/lib/gameId";

export function getSolution(gameId, wordLength) {
  if (gameId > getTodaysGameId()) {
    throw new Error("Invalid game ID - cannot peek into the future");
  }

  const parsedWordLength = parseInt(wordLength);
  const wordList = woorden[parsedWordLength];
  const wrappedGameId = gameId % wordList.length;

  return {
    word: wordList[wrappedGameId],
  };
}

export function getRandomWord(wordLength) {
  const parsedWordLength = parseInt(wordLength);
  const wordList = woorden[parsedWordLength];
  const idx = Math.floor(Math.random() * wordList.length);
  return wordList[idx];
}

export function getRandomWords(amount, wordLength) {
  const parsedWordLength = parseInt(wordLength);
  const wordList = woorden[parsedWordLength];
  const words = [];

  for (let i = 0; i < amount; i++) {
    words.push(wordList[Math.floor(Math.random() * wordList.length)]);
  }

  return words;
}
