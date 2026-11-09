import { MULTIPLAYER_URL } from "./config";

async function post(path, body) {
  const res = await fetch(`${MULTIPLAYER_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.code) throw new Error(data.error || "server_error");
  return data.code;
}

/**
 * New room for friends (up to 8 players), returns its code.
 * `listed` puts it in the public list of open rooms.
 */
export const createRoom = (wordLength, listed = false) => post("/rooms", { wordLength, listed });

/** Code of a public room that's waiting for players. */
export const quickMatch = (wordLength) => post("/quickmatch", { wordLength });

/** Top 10 this week and all time, plus your own rank ({ week, all }). */
export async function fetchLeaderboard() {
  const { getToken } = await import("./identity");
  const res = await fetch(`${MULTIPLAYER_URL}/leaderboard?t=${encodeURIComponent(getToken())}`);
  if (!res.ok) throw new Error("server_error");
  return res.json();
}
