import { getTodaysGameId } from "./gameId";
import woorden from "../data/woorden.json";
import { getCurrentWordFromAirTable } from "./airtable";
import { gameIdToIndex } from "./helpers";
import { acceptLanguage } from "next/dist/server/accept-header";

const i18n = {
  locales: ["nl-NL", "nl-BE"],
  defaultLocale: "nl-BE",
  localeDetection: false,

  domains: [
    {
      domain: "www.woordje.be",
      defaultLocale: "nl-BE",
    },
    {
      domain: "www.woordol.nl",
      defaultLocale: "nl-NL",
    },
  ],
};

export function currentLocale(req) {
  if (!i18n) return "";
  const chosenLocale = i18n.locales.find(
    (locale) => locale == req.cookies.NEXT_LOCALE
  );
  const detectedLocale =
    chosenLocale ??
    acceptLanguage(req.headers["accept-language"], i18n.locales);
  return detectedLocale || i18n.defaultLocale;
}

export async function getSolution(l, gameId, locale) {
  if (l === "vrttaal") {
    try {
      const { Woord, Uitleg } = await getCurrentWordFromAirTable();
      return { word: Woord.toLowerCase(), meaning: Uitleg };
    } catch (e) {
      return { word: "", meaning: "" };
    }
  } else {
    return {
      word: woorden[parseInt(l)][gameIdToIndex(gameId, locale)],
    };
  }
}

export function getRandomWord(l) {
  const idx = Math.floor(Math.random() * woorden[l].length);
  const word = woorden[l][idx];
  return word;
}

export function getDemoWords(l) {
  const wordLength = l;

  const words = [];

  for (let i = 0; i < 3; i++) {
    words.push(
      woorden[wordLength][
        Math.floor(Math.random() * woorden[wordLength].length)
      ]
    );
  }

  return words;
}

export function gettranslations(ctx) {
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
