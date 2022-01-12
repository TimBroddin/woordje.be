import { NextResponse } from "next/server";
import woorden from "../data/woorden2.json";

import { getGameId } from "../lib/gameId";

const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const firstDate = new Date(2022, 0, 10).valueOf();
const secondDate = new Date().valueOf();

export default async function middleware(req) {
  const GAME_ID = getGameId();

  if (req.nextUrl.pathname === "/random") {
    const WORD_LENGTH = parseInt(req.nextUrl.searchParams.get("l"));

    const idx = Math.floor(Math.random() * woorden[WORD_LENGTH].length);
    const word = woorden[WORD_LENGTH][idx];
    return NextResponse.json(word);
  }
  if (req.nextUrl.pathname === "/debug") {
    const WORD_LENGTH = parseInt(req.nextUrl.searchParams.get("l"));

    const WORD = woorden[WORD_LENGTH][GAME_ID];

    return NextResponse.json({
      firstDate,
      secondDate,
      GAME_ID,
      diff: Math.abs((firstDate - secondDate) / oneDay),
      WORD,
    });
  }
  if (req.nextUrl.pathname === "/check") {
    const WORD_LENGTH = parseInt(req.nextUrl.searchParams.get("l"));

    const WORD = woorden[WORD_LENGTH][GAME_ID];

    const word = req.nextUrl.searchParams
      .get("word")
      .toLowerCase()
      .slice(0, WORD.length);

    // if the word doesn't match, assert it's a
    // dictionary word
    if (word !== WORD) {
      const matchingWords = woorden[WORD_LENGTH].filter((w) => word === w);

      if (!matchingWords.length) {
        return NextResponse.json({
          error: "unknown_word",
        });
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

    return NextResponse.json({
      match,
    });
  } else {
    return null;
  }
}
