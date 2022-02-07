import { NextResponse } from "next/server";

import { getGameId } from "../lib/gameId";

const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const firstDate = new Date(2022, 0, 10).valueOf();
const secondDate = new Date().valueOf();
let woorden = false;
export default async function middleware(req) {
  const GAME_ID = getGameId();

  if (!woorden) {
    console.log("Populating wooorden");
    const res = await fetch(
      "https://woordje-be-git-pwa-broddin.vercel.app/data/woorden.json"
    );
    woorden = await await res.json();
  }

  if (req.nextUrl.pathname === "/api/random") {
    const WORD_LENGTH = parseInt(req.nextUrl.searchParams.get("l"));

    const idx = Math.floor(Math.random() * woorden[WORD_LENGTH].length);
    const word = woorden[WORD_LENGTH][idx];
    return NextResponse.json(word);
  }

  if (req.nextUrl.pathname === "/api/demo") {
    const WORD_LENGTH = parseInt(req.nextUrl.searchParams.get("l"));

    const words = [];

    for (let i = 0; i < 3; i++) {
      words.push(
        woorden[WORD_LENGTH][
          Math.floor(Math.random() * woorden[WORD_LENGTH].length)
        ]
      );
    }

    return NextResponse.json(words);
  }

  if (req.nextUrl.pathname === "/api/solutions") {
    return NextResponse.json(
      [3, 4, 5, 6, 7, 8].map((idx) => woorden[idx][GAME_ID])
    );
  }
  if (req.nextUrl.pathname === "/api/debug") {
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
  if (req.nextUrl.pathname === "/api/check") {
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
