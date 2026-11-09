// Pronounceable 5 letter room codes (consonant-vowel-consonant-vowel-consonant),
// easy to read out loud across the table: "KABOM", "TERUL", ...
const CONSONANTS = "BDFGHJKLMNPRSTVWZ";
const VOWELS = "AEIOU";

export const CODE_PATTERN = /^[A-Z]{5}$/;

export function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return Array.from(bytes, (b, i) => {
    const set = i % 2 === 0 ? CONSONANTS : VOWELS;
    return set[b % set.length];
  }).join("");
}

export const normalizeCode = (code) => String(code ?? "").trim().toUpperCase();

/** One-way id for the leaderboard: the secret token itself never leaves the room. */
export async function hashToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`woordje:${token}`));
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
