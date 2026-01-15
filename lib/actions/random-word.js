"use server";

import { getRandomWord } from "@/lib/data/solution";

export async function fetchRandomWord(wordLength) {
  return getRandomWord(wordLength);
}
