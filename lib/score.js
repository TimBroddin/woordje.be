/**
 * Score a guess against the solution, Wordle style.
 * Pure and dependency free: shared by the daily game (server action) and the
 * multiplayer room server (Cloudflare Worker).
 *
 * @param {string} word - the solution
 * @param {string} text - the guess, same length as the solution
 * @returns {{letter: string, score: "good" | "off" | "bad"}[]}
 */
export function scoreGuess(word, text) {
  const lettersToCheck = word.split("");
  const letters = text.split("");
  const match = letters.map((letter) => ({ letter, score: "bad" }));

  // First pass: exact matches (green). Walk backwards so splicing keeps the
  // remaining indexes valid.
  for (let i = letters.length - 1; i >= 0; i--) {
    if (word[i] === letters[i]) {
      match[i].score = "good";
      lettersToCheck.splice(i, 1);
    }
  }

  // Second pass: right letter, wrong place (yellow)
  letters.forEach((letter, i) => {
    if (lettersToCheck.includes(letter) && match[i].score !== "good") {
      match[i].score = "off";
      lettersToCheck.splice(lettersToCheck.indexOf(letter), 1);
    }
  });

  return match;
}

export const isSolved = (match) => match.every((l) => l.score === "good");
