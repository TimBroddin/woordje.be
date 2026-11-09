// Dutch copy for server error codes
const MESSAGES = {
  unknown_word: "Ongeldig woord",
  wrong_length: "Dat woord heeft niet genoeg letters",
  not_host: "Alleen de host kan dat doen",
  not_enough_players: "Je hebt minstens 2 spelers nodig",
  already_started: "De ronde is al begonnen",
  not_playing: "De ronde is voorbij",
  done: "Je bent al klaar voor deze ronde",
  spectating: "Je speelt mee vanaf de volgende ronde",
  not_allowed: "Dat kan niet in deze kamer",
  not_waiting: "Het spel is al aan het starten",
  not_found: "Deze kamer bestaat niet (meer)",
  full: "Deze kamer is vol",
};

export const errorMessage = (code) => MESSAGES[code] || "Er is een fout opgetreden";

export function formatDuration(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}
