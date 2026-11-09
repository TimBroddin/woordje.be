import woorden from "../../data/woorden.json";
import { getTodaysGameId } from "../../lib/gameId.js";

// Same dictionary as the daily game. Sets are built lazily per word length.
const sets = {};

/**
 * Pick a random word that isn't in `blocked`. Gives up after a few tries and
 * returns whatever it drew (only reachable with absurdly small word lists).
 */
export function pickWord(list, blocked, rng = Math.random) {
  let word;
  for (let i = 0; i < 25; i++) {
    word = list[Math.floor(rng() * list.length)];
    if (!blocked.has(word)) return word;
  }
  return word;
}

/** Today's and tomorrow's daily word: a multiplayer round must never spoil them. */
export function dailyWords(list, gameId = getTodaysGameId()) {
  return [list[gameId % list.length], list[(gameId + 1) % list.length]];
}

export const dict = {
  isValid(wordLength, text) {
    sets[wordLength] ??= new Set(woorden[wordLength] ?? []);
    return sets[wordLength].has(text);
  },
  /** A fresh word: not a daily word, and not one this room already had. */
  random(wordLength, recent = []) {
    const list = woorden[wordLength];
    return pickWord(list, new Set([...dailyWords(list), ...recent]));
  },
};
