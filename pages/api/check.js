import woorden from "../../data/woorden.json";
import { getGameId } from "../../lib/gameId";

export default function handler(req, res) {
  const GAME_ID = getGameId();
  const WORD_LENGTH = parseInt(req.query?.l);

  const WORD = woorden[WORD_LENGTH][GAME_ID];

  const word = req.query?.word.toLowerCase().slice(0, WORD.length);

  // if the word doesn't match, assert it's a
  // dictionary word
  if (word !== WORD) {
    const matchingWords = woorden[WORD_LENGTH].filter((w) => word === w);

    if (!matchingWords.length) {
      res.status(200).json({ error: "unknown_word" });
      return;
    }
  }

  const lettersToCheck = WORD.split("");
  const letters = word.split("");
  const match = letters.map((letter) => ({
    letter: letter,
    score: "bad",
  }));
  for (let i = letters.length - 1; i >= 0; i--) {
    if (WORD[i] === letters[i]) {
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

  res.status(200).json({ match });
}
