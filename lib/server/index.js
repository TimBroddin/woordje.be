import woorden from "@/data/woorden.json";
import { getTodaysGameId } from "../gameId";
import getTurso from "@/lib/turso";

export async function getSolution(gameId, wordLength, customGame) {
  if (gameId > getTodaysGameId()) {
    throw new Error(
      "Not driving 88mph. If My Calculations Are Correct, When This Baby Hits 88 Miles Per Hour, You're Gonna See Some Serious Shit."
    );
  }

  const wordList = woorden[parseInt(wordLength)];
  const wrappedGameId = gameId % wordList.length;

  return {
    word: wordList[wrappedGameId],
  };
}

export function getRandomWord(l) {
  const idx = Math.floor(Math.random() * woorden[l].length);
  const word = woorden[l][idx];
  return word;
}

export function getRandomWords(amount, l) {
  const wordLength = l;

  const words = [];

  for (let i = 0; i < amount; i++) {
    words.push(
      woorden[wordLength][
        Math.floor(Math.random() * woorden[wordLength].length)
      ]
    );
  }

  return words;
}

const getGameType = async (gameId, wordLength, customGame) => {
  const parsedWordLength = parseInt(wordLength);
  const wordList = woorden[parsedWordLength];
  const wrappedGameId = gameId % wordList.length;

  return {
    wordLength: parsedWordLength,
    word: wordList[wrappedGameId],
  };
};

export const check = async (text, gameId, l, customGame) => {
  const { wordLength, word } = await getGameType(gameId, l, customGame);

  if (gameId > getTodaysGameId()) {
    throw new Error(
      "Not driving 88mph. If My Calculations Are Correct, When This Baby Hits 88 Miles Per Hour, You're Gonna See Some Serious Shit."
    );
  }

  if (word !== text) {
    const matchingWords = woorden[wordLength].filter((w) => text === w);
    if (!matchingWords.length) {
      throw new Error("unknown word");
      return;
    }
  }

  const lettersToCheck = word.split("");
  const letters = text.split("");
  const match = letters.map((letter) => ({
    letter: letter,
    score: "bad",
  }));
  for (let i = letters.length - 1; i >= 0; i--) {
    if (word[i] === letters[i]) {
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

export const getStatistics = async (gameId, wordLength, gameType) => {
  const turso = getTurso();
  const statsResult = await turso.execute({
    sql: "SELECT wins, total FROM stats WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  });

  const statsRow = statsResult.rows[0];
  const wins = statsRow
      ? Math.round((statsRow.wins / statsRow.total) * 100)
      : 0;

  const total = statsRow ? statsRow.total : 0;

  const distributionResult = await turso.execute({
    sql: "SELECT tries, amount FROM StatsDistribution WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  });

  const distribution = distributionResult.rows.map((row) => ({
    tries: row.tries,
    amount: total ? Math.round((row.amount / total) * 100) : 0,
  }));

  return { wins, distribution };
};
