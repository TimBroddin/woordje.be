import { getGameId } from "./gameId";
import woorden from "../data/woorden.json";
import { getCurrentWordFromAirTable } from "./airtable";

export async function getSolution(l) {
  const GAME_ID = getGameId();

  if (l === "vrttaal") {
    const { Woord, Uitleg } = await getCurrentWordFromAirTable();
    return { word: Woord.toLowerCase(), meaning: Uitleg };
  } else {
    return { word: woorden[parseInt(l)][GAME_ID] };
  }
}

export function getRandomWord(l) {
  const idx = Math.floor(Math.random() * woorden[l].length);
  const word = woorden[l][idx];
  return word;
}

export function getDemoWords(l) {
  const WORD_LENGTH = l;

  const words = [];

  for (let i = 0; i < 3; i++) {
    words.push(
      woorden[WORD_LENGTH][
        Math.floor(Math.random() * woorden[WORD_LENGTH].length)
      ]
    );
  }

  return words;
}
