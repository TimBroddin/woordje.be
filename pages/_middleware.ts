import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import woorden from "../data/woorden.json"
import { getGameId } from "../lib/gameId";


const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const firstDate = new Date(2022, 0, 10).valueOf();
const secondDate = new Date().valueOf();

;
export default async function middleware(req : NextRequest) : Promise<NextResponse> {
    const GAME_ID = getGameId();
    const WORD = woorden[GAME_ID];

    if (req.nextUrl.pathname === "/random") {
        const idx = Math.floor(Math.random()*woorden.length);
        const word = woorden[idx];
        return NextResponse.json(word)
    }
    if (req.nextUrl.pathname === "/debug") {

        return NextResponse.json({ firstDate, secondDate, WORD, GAME_ID, diff: Math.abs((firstDate - secondDate) / oneDay)})
    }
  if (req.nextUrl.pathname === "/check") {
    const word = req.nextUrl.searchParams
      .get("word")
      .toLowerCase()
      .slice(0, WORD.length);

    // if the word doesn't match, assert it's a
    // dictionary word
    if (word !== WORD) {
      const matchingWords = woorden.filter(w => word === w);

      if (!matchingWords.length) {
        return NextResponse.json({
          error: "unknown_word",
        });
      }
    }

    const lettersToCheck = WORD.split("")
    const letters = word.split("")
    const match = letters.map((letter) => (
      {
        letter: letter,
        score: "bad"
      }
    ))
    for (let i = letters.length - 1; i >= 0; i--) {
      if (WORD[i] === letters[i]) {
        match[i].score = "good"
        lettersToCheck.splice(i, 1)
      }
    }
    letters.forEach((letter, i) => {
      if (lettersToCheck.includes(letter) && match[i].score !== "good") {
        match[i].score = "off"
        lettersToCheck.splice(lettersToCheck.indexOf(letter), 1)
      }
    })

    return NextResponse.json({
      match
    });
  } else {
    return null;
  }
}