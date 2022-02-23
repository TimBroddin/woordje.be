import woorden from "@/data/woorden.json";
import { getCurrentWordFromAirTable } from "../airtable";
import { gameIdToIndex } from "../helpers";
import { getTodaysGameId } from "@/lib/gameId";

export async function getSolution(gameId, wordLength, customGame) {
  if (customGame === "vrttaal") {
    try {
      const { Woord, Uitleg } = await getCurrentWordFromAirTable();
      return { word: Woord.toLowerCase(), meaning: Uitleg };
    } catch (e) {
      return { word: "", meaning: "" };
    }
  } else {
    return {
      word: woorden[parseInt(wordLength)][gameId],
    };
  }
}

export function getRandomWord(l) {
  const idx = Math.floor(Math.random() * woorden[l].length);
  const word = woorden[l][idx];
  return word;
}

export function getRandomWords(amount, l) {
  const wordLength = l;

  const words = [];

  for (let i = 0; i < amount; i++) {
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

const getGameType = async (gameId, wordLength, customGame) => {
  if (customGame === "vrttaal") {
    const { Woord } = await getCurrentWordFromAirTable();
    return {
      wordLength: Woord.length,
      word: Woord.toLowerCase(),
    };
  } else {
    return {
      wordLength: parseInt(wordLength),
      word: woorden[parseInt(wordLength)][gameId],
    };
  }
};

export const check = async (text, gameId, l, customGame) => {
  const { wordLength, word } = await getGameType(gameId, l, customGame);

  if (word !== text) {
    const matchingWords = woorden[wordLength].filter((w) => text === w);
    if (!matchingWords.length) {
      throw new Error("unknown word");
      return;
    }
  }

  const lettersToCheck = word.split("");
  const letters = text.split("");
  const match = letters.map((letter) => ({
    letter: letter,
    score: "bad",
  }));
  for (let i = letters.length - 1; i >= 0; i--) {
    if (word[i] === letters[i]) {
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

  return match;
};
