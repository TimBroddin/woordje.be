import { getGameId } from "./gameId";
import woorden from "../data/woorden.json";
import { getCurrentWordFromAirTable } from "./airtable";

export async function getSolution(l) {
  const GAME_ID = getGameId();

  if (l === "vrttaal") {
    try {
      const { Woord, Uitleg } = await getCurrentWordFromAirTable();
      return { word: Woord.toLowerCase(), meaning: Uitleg };
    } catch (e) {
      return { word: "", meaning: "" };
    }
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

export function getBrand(ctx) {
  switch (ctx.locale) {
    case "nl-BE":
      return {
        id: "woordje",
        title: "Woordje",
        url: "https://www.woordje.be",
        description:
          "Een dagelijks woordspelletje gebaseerd op Wordle. De Vlaamse Wordle, voor België en Nederland, met 3 tot 10 letters.",
        manifest: "manifest_be.json",
        share_html: '<a href="https://woordje.be">woordje.be</a>',
        share_text: "woordje.be",
        share_hashtag: "#woordje",
      };
      break;
    case "nl-NL":
      return {
        id: "woordol",
        title: "Woordol",
        url: "https://www.woordol.nl",
        description:
          "Een dagelijks woordspelletje gebaseerd op Wordle. De Nederlandse Wordle, met 3 tot 10 letters.",
        manifest: "manifest_nl.json",
        share_html: '<a href="https://woordol.nl">Woordol.nl</a>',
        share_text: "woordol.nl",
        share_hashtag: "#woordol",
      };
  }
  return "woordje";
}
