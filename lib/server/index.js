import woorden from "@/data/woorden.json";
import { getTodaysGameId } from "../gameId";

export async function getSolution(gameId, wordLength, customGame) {
  if (gameId > getTodaysGameId()) {
    throw new Error(
      "Not driving 88mph. If My Calculations Are Correct, When This Baby Hits 88 Miles Per Hour, You're Gonna See Some Serious Shit."
    );
  }

  return {
    word: woorden[parseInt(wordLength)][gameId],
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
  return {
    wordLength: parseInt(wordLength),
    word: woorden[parseInt(wordLength)][gameId],
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

