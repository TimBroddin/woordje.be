import { Room, createRoom, roomStub } from "./room.js";
import { Matchmaker } from "./matchmaker.js";
import { Directory, directoryStub } from "./directory.js";
import { CODE_PATTERN, normalizeCode, hashToken, TOKEN_PATTERN } from "./codes.js";
import { MIN_WORD_LENGTH, MAX_WORD_LENGTH } from "./game.js";

const readBody = (request) => request.json().catch(() => ({}));

export { Room, Matchmaker, Directory };

/**
 * ALLOWED_ORIGINS is a comma separated list; "*" in an entry matches any
 * subdomain part (e.g. "https://*.vercel.app"). Localhost is always allowed.
 */
function isAllowedOrigin(origin, env) {
  if (!origin) return true; // non-browser clients
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  const allowed = (env.ALLOWED_ORIGINS ?? "*").split(",").map((s) => s.trim()).filter(Boolean);
  return allowed.some((entry) => {
    if (entry === "*") return true;
    const pattern = new RegExp(
      "^" + entry.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^.]+") + "$"
    );
    return pattern.test(origin);
  });
}

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const json = (body, status, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });

function readWordLength(body) {
  const wordLength = parseInt(body.wordLength);
  if (!(wordLength >= MIN_WORD_LENGTH && wordLength <= MAX_WORD_LENGTH)) return null;
  return wordLength;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (!isAllowedOrigin(origin, env)) return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      // POST /rooms {wordLength, maxPlayers} → a new private room
      if (url.pathname === "/rooms" && request.method === "POST") {
        const body = await readBody(request);
        const wordLength = readWordLength(body);
        if (!wordLength) return json({ error: "bad_word_length" }, 400, origin);
        // maxPlayers is clamped to 2–8 by the room; missing means 8
        const code = await createRoom(env, {
          isPublic: false,
          wordLength,
          maxPlayers: body.maxPlayers,
          listed: body.listed === true,
        });
        return json({ code }, 201, origin);
      }

      // POST /quickmatch {wordLength} → code of a public room that is filling up
      if (url.pathname === "/quickmatch" && request.method === "POST") {
        const wordLength = readWordLength(await readBody(request));
        if (!wordLength) return json({ error: "bad_word_length" }, 400, origin);
        const matchmaker = env.MATCHMAKER.get(env.MATCHMAKER.idFromName(`quick-${wordLength}`));
        const code = await matchmaker.find(wordLength);
        return json({ code }, 200, origin);
      }

      // GET /lobby?v=<presence id> → { online, playing, rooms } for the multiplayer page
      if (url.pathname === "/lobby" && request.method === "GET") {
        const visitor = url.searchParams.get("v");
        const snapshot = await directoryStub(env).snapshot(/^[a-f0-9]{16,64}$/.test(visitor ?? "") ? visitor : null);
        return json(snapshot, 200, origin);
      }

      // GET /leaderboard?t=<token> → top 10 this week and all time, plus your own rank
      if (url.pathname === "/leaderboard" && request.method === "GET") {
        const token = url.searchParams.get("t") ?? "";
        const player = TOKEN_PATTERN.test(token) ? await hashToken(token) : null;
        return json(await directoryStub(env).leaderboard(player), 200, origin);
      }

      // GET /rooms/:code/ws → WebSocket into the room
      const ws = url.pathname.match(/^\/rooms\/([A-Za-z]+)\/ws$/);
      if (ws && request.method === "GET") {
        const code = normalizeCode(ws[1]);
        if (!CODE_PATTERN.test(code)) return json({ error: "not_found" }, 404, origin);
        if (request.headers.get("Upgrade") !== "websocket") {
          return json({ error: "expected_websocket" }, 426, origin);
        }
        return roomStub(env, code).fetch(request);
      }

      if (url.pathname === "/") return new Response("woordje multiplayer ok");
      return json({ error: "not_found" }, 404, origin);
    } catch (err) {
      console.error(err);
      return json({ error: "server_error" }, 500, origin);
    }
  },
};
