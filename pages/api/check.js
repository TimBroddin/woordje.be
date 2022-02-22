import woorden from "../../data/woorden.json";
import { getTodaysGameId } from "../../lib/gameId";
import { getCurrentWordFromAirTable } from "../../lib/airtable";
import { gameIdToIndex } from "../../lib/helpers";
import { currentLocale } from "../../lib/ssr";

const getGameType = async (l, gameId, locale) => {
  if (l === "vrttaal") {
    const { Woord } = await getCurrentWordFromAirTable();
    return {
      wordLength: Woord.length,
      WORD: Woord.toLowerCase(),
    };
  } else {
    return {
      wordLength: parseInt(l),
      WORD: woorden[parseInt(l)][gameIdToIndex(gameId, locale)],
    };
  }
};

export default async function handler(req, res) {
  const gameId = parseInt(req.query.gameId);
  const locale = currentLocale(req);
  const { wordLength, WORD } = await getGameType(req.query.l, gameId, locale);
  const word = req.query?.word.toLowerCase().slice(0, WORD.length);

  // if the word doesn't match, assert it's a
  // dictionary word
  if (word !== WORD) {
    const matchingWords = woorden[wordLength].filter((w) => word === w);

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
