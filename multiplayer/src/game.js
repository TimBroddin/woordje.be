/**
 * Pure multiplayer room logic. No Cloudflare APIs in here so it can be unit
 * tested with `bun test`. The Room Durable Object owns one state object,
 * calls these functions to mutate it, then persists + broadcasts.
 *
 * Mode: race. Everybody in the room gets the same secret word. Fewest guesses
 * wins, ties are broken by time. Once someone solves it the others get
 * HURRY_MS to finish.
 */
import { scoreGuess, isSolved } from "../../lib/score.js";

export const MIN_WORD_LENGTH = 3;
export const MAX_WORD_LENGTH = 10;
export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;
export const NAME_MAX = 16;

// Open games (quick match) start on a timer: once a second player is in,
// strangers get QUICK_WAIT_MS to join too. Full rooms start almost right away.
// Rooms with friends start when the host says so.
export const QUICK_WAIT_MS = 15_000; // time for extra players to join an open game
export const FULL_WAIT_MS = 5_000; // room reached its player count
export const JOIN_GRACE_MS = 10_000; // a late joiner always gets at least this long
export const PRIVATE_COUNTDOWN_MS = 3_000; // host pressed start → 3, 2, 1
export const ROUND_MS = 4 * 60_000; // hard cap per round
export const HURRY_MS = 60_000; // after the first solve, the rest get this long
export const DISCONNECT_GRACE_MS = 30_000; // mid-round: forfeit after being gone this long
export const LOBBY_PRUNE_MS = 2 * 60_000; // drop offline players from private rooms at round start

export const RECENT_WORDS = 50;

export const maxGuessesFor = (wordLength) => wordLength + 1;

export function createRoomState({ code, isPublic, wordLength, listed, now }) {
  return {
    v: 1,
    code,
    isPublic: !!isPublic,
    wordLength: clampLength(wordLength),
    maxPlayers: MAX_PLAYERS,
    // Shown in the list of open rooms? Quick match rooms always; private rooms if the host wants
    listed: isPublic ? true : !!listed,
    startTrigger: null, // what started the current round: timer | full | host (analytics)
    // lobby: < 2 players · waiting: join timer running · countdown: 3, 2, 1
    phase: "lobby", // lobby | waiting | countdown | playing | finished
    round: 0,
    word: null,
    deadline: null, // countdown end, or round end while playing
    roundStartedAt: null,
    firstSolveAt: null,
    results: null,
    players: [],
    nextPlayerNo: 1,
    recentWords: [], // never repeat a word within a room
    createdAt: now,
    lastActivity: now,
  };
}

const clampLength = (n) => {
  const len = parseInt(n);
  if (!Number.isFinite(len)) return 5;
  return Math.min(MAX_WORD_LENGTH, Math.max(MIN_WORD_LENGTH, len));
};

/** Player cap: 8 (rooms created with a chosen size before keep theirs until they expire). */
export const roomSize = (state) => state.maxPlayers ?? MAX_PLAYERS;

export function cleanName(name, fallback) {
  const cleaned = String(name ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NAME_MAX);
  return cleaned || fallback;
}

export const getPlayer = (state, id) => state.players.find((p) => p.id === id);
export const connectedPlayers = (state) => state.players.filter((p) => p.connected);
const activePlayers = (state) => state.players.filter((p) => p.playing);

/** The host is the longest-present connected player (falls back to the first). */
export function hostId(state) {
  return (connectedPlayers(state)[0] ?? state.players[0])?.id ?? null;
}

/** Can the matchmaker still send new people to this room? */
export function isJoinable(state, now) {
  if (!state.isPublic) return false;
  if (connectedPlayers(state).length >= roomSize(state)) return false;
  if (state.phase === "lobby") return true;
  return state.phase === "waiting" && state.deadline - now > 2_000;
}

/**
 * A socket connected with this token. Reconnects keep the same player (and
 * their guesses mid-round); new tokens become a new player.
 */
export function join(state, { token, name, presence = null }, now) {
  let player = state.players.find((p) => p.token === token);
  const isNew = !player;

  if (player) {
    player.connected = true;
    player.disconnectedAt = null;
    if (name) player.name = cleanName(name, player.name);
    if (presence) player.presence = presence;
  } else {
    if (state.players.length >= roomSize(state)) {
      // Make room by dropping someone who left and isn't mid-round
      const idx = state.players.findIndex((p) => !p.connected && !(state.phase === "playing" && p.playing));
      if (idx === -1) return { error: "full" };
      state.players.splice(idx, 1);
    }
    const no = state.nextPlayerNo++;
    player = {
      id: `p${no}`,
      token,
      presence, // anonymous id from the multiplayer page, only used to count people once
      name: cleanName(name, `Speler ${no}`),
      connected: true,
      disconnectedAt: null,
      wins: 0,
      playing: false, // only true for players that were present when the round started
      guesses: [],
      solvedMs: null,
      doneAt: null,
      forfeit: false,
    };
    state.players.push(player);
  }

  state.lastActivity = now;
  updateWaiting(state, now, { joined: isNew });
  return { player };
}

export function disconnect(state, id, now) {
  const player = getPlayer(state, id);
  if (!player) return;
  player.connected = false;
  player.disconnectedAt = now;

  // Quick match lobbies are anonymous; nobody needs to see who walked away
  if (state.isPublic && (state.phase === "lobby" || state.phase === "waiting")) {
    state.players = state.players.filter((p) => p.id !== id);
  }

  updateWaiting(state, now);
}

/** Explicit "leave room" from the player. */
export function leave(state, id, now) {
  const player = getPlayer(state, id);
  if (!player) return;
  if (state.phase === "playing" && player.playing) {
    disconnect(state, id, now);
    if (!player.doneAt) {
      player.doneAt = now;
      player.forfeit = true;
    }
    maybeFinish(state, now);
  } else {
    state.players = state.players.filter((p) => p.id !== id);
    updateWaiting(state, now);
  }
}

/**
 * Open games start on their own: a timer runs once two players are in, a full
 * room starts almost immediately, and late joiners always get a few seconds.
 */
function updateWaiting(state, now, { joined = false } = {}) {
  if (!state.isPublic) return; // friends: the host starts
  if (state.phase !== "lobby" && state.phase !== "waiting") return;
  const count = connectedPlayers(state).length;
  const full = count >= roomSize(state);

  if (count < MIN_PLAYERS) {
    state.phase = "lobby";
    state.deadline = null;
  } else if (state.phase === "lobby") {
    state.phase = "waiting";
    state.deadline = now + (full ? FULL_WAIT_MS : QUICK_WAIT_MS);
  } else if (full) {
    state.deadline = Math.min(state.deadline, now + FULL_WAIT_MS);
  } else if (joined) {
    state.deadline = Math.max(state.deadline, now + JOIN_GRACE_MS);
  }
}

const isHostOfPrivate = (state, id) => {
  if (state.isPublic) return { error: "not_allowed" };
  if (hostId(state) !== id) return { error: "not_host" };
  return null;
};

const canConfigure = (state) => ["lobby", "waiting", "finished"].includes(state.phase);

/** Host: start the game (any round) once at least two people are in. */
export function requestStart(state, id, now) {
  const denied = isHostOfPrivate(state, id);
  if (denied) return denied;
  if (!canConfigure(state)) return { error: "already_started" };
  if (connectedPlayers(state).length < MIN_PLAYERS) return { error: "not_enough_players" };

  state.phase = "countdown";
  state.deadline = now + PRIVATE_COUNTDOWN_MS;
  state.lastActivity = now;
  return {};
}

export function setWordLength(state, id, wordLength) {
  const denied = isHostOfPrivate(state, id);
  if (denied) return denied;
  if (!canConfigure(state)) return { error: "already_started" };
  state.wordLength = clampLength(wordLength);
  return {};
}

/** Host: show the room in the public list of open rooms (or hide it again). */
export function setListed(state, id, listed) {
  const denied = isHostOfPrivate(state, id);
  if (denied) return denied;
  state.listed = !!listed;
  return {};
}

export function rename(state, id, name) {
  const player = getPlayer(state, id);
  if (!player) return { error: "unknown_player" };
  player.name = cleanName(name, player.name);
  return {};
}

function startRound(state, now, dict, trigger) {
  // Private rooms keep offline players around for a bit (wins tally), but not forever
  state.players = state.players.filter(
    (p) => p.connected || now - (p.disconnectedAt ?? now) < LOBBY_PRUNE_MS
  );

  if (connectedPlayers(state).length === 0) {
    state.phase = "lobby";
    state.deadline = null;
    return;
  }

  state.round += 1;
  state.startTrigger = trigger;
  state.recentWords ??= []; // rooms created before this field existed
  state.word = dict.random(state.wordLength, state.recentWords);
  state.recentWords = [...state.recentWords, state.word].slice(-RECENT_WORDS);
  state.phase = "playing";
  state.roundStartedAt = now;
  state.firstSolveAt = null;
  state.deadline = now + ROUND_MS;
  state.results = null;

  for (const p of state.players) {
    p.playing = p.connected;
    p.guesses = [];
    p.solvedMs = null;
    p.doneAt = null;
    p.forfeit = false;
  }
}

export function guess(state, id, rawText, now, dict) {
  if (state.phase !== "playing") return { error: "not_playing" };
  const player = getPlayer(state, id);
  if (!player || !player.playing) return { error: "spectating" };
  if (player.doneAt) return { error: "done" };

  const text = String(rawText ?? "").toLowerCase();
  if (text.length !== state.wordLength) return { error: "wrong_length" };
  if (!/^[a-z]+$/.test(text)) return { error: "unknown_word" };
  if (text !== state.word && !dict.isValid(state.wordLength, text)) {
    return { error: "unknown_word" };
  }

  const match = scoreGuess(state.word, text);
  player.guesses.push(match);
  state.lastActivity = now;

  if (isSolved(match)) {
    player.solvedMs = now - state.roundStartedAt;
    player.doneAt = now;
    if (!state.firstSolveAt) {
      state.firstSolveAt = now;
      state.deadline = Math.min(state.deadline, now + HURRY_MS);
    }
  } else if (player.guesses.length >= maxGuessesFor(state.wordLength)) {
    player.doneAt = now;
  }

  maybeFinish(state, now);
  return { match };
}

function maybeFinish(state, now) {
  if (state.phase !== "playing") return;
  const active = activePlayers(state);
  if (active.length === 0 || active.every((p) => p.doneAt)) finishRound(state, now);
}

/** Order: solved before unsolved, then fewest guesses, then fastest. */
export function rankPlayers(players) {
  return [...players].sort((a, b) => {
    const aSolved = a.solvedMs !== null;
    const bSolved = b.solvedMs !== null;
    if (aSolved !== bSolved) return aSolved ? -1 : 1;
    if (!aSolved) return 0;
    return a.guesses.length - b.guesses.length || a.solvedMs - b.solvedMs;
  });
}

function finishRound(state, now) {
  state.phase = "finished";
  state.deadline = null;

  const ranking = rankPlayers(activePlayers(state));
  const winner = ranking[0]?.solvedMs !== null ? ranking[0] : null;
  if (winner) winner.wins += 1;

  state.results = {
    winnerId: winner?.id ?? null,
    ranking: ranking.map((p) => p.id),
  };
  state.lastActivity = now;
}

/** Called from the Durable Object alarm (and after every event). */
export function tick(state, now, dict) {
  if ((state.phase === "waiting" || state.phase === "countdown") && now >= state.deadline) {
    const trigger =
      state.phase === "countdown" ? "host" : connectedPlayers(state).length >= roomSize(state) ? "full" : "timer";
    startRound(state, now, dict, trigger);
    return;
  }

  if (state.phase === "playing") {
    // People who vanished mid-round forfeit after a grace period
    for (const p of activePlayers(state)) {
      if (!p.connected && !p.doneAt && now - p.disconnectedAt >= DISCONNECT_GRACE_MS) {
        p.doneAt = now;
        p.forfeit = true;
      }
    }
    if (now >= state.deadline) finishRound(state, now);
    else maybeFinish(state, now);
  }
}

/** When should the room wake up next for a time based transition? */
export function nextWakeup(state) {
  if (state.phase === "waiting" || state.phase === "countdown") return state.deadline;
  if (state.phase !== "playing") return null;

  let next = state.deadline;
  for (const p of activePlayers(state)) {
    if (!p.connected && !p.doneAt) {
      next = Math.min(next, p.disconnectedAt + DISCONNECT_GRACE_MS);
    }
  }
  return next;
}

/**
 * What one player is allowed to see. Opponents' guesses are colours only
 * until the round is over; the word is only sent once the round is over.
 */
export function viewFor(state, youId, now) {
  const finished = state.phase === "finished";
  const host = hostId(state);

  return {
    type: "state",
    now,
    code: state.code,
    isPublic: state.isPublic,
    wordLength: state.wordLength,
    maxPlayers: roomSize(state),
    listed: !!state.listed,
    startTrigger: state.startTrigger ?? null,
    maxGuesses: maxGuessesFor(state.wordLength),
    phase: state.phase,
    round: state.round,
    deadline: state.deadline,
    hurry: state.phase === "playing" && !!state.firstSolveAt,
    hostId: host,
    you: youId,
    word: finished ? state.word : null,
    results: finished ? state.results : null,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      isHost: p.id === host,
      wins: p.wins,
      playing: p.playing,
      done: !!p.doneAt,
      solved: p.solvedMs !== null,
      solvedMs: p.solvedMs,
      forfeit: p.forfeit,
      guesses:
        p.id === youId || finished
          ? p.guesses
          : p.guesses.map((row) => row.map(({ score }) => ({ score }))),
    })),
  };
}

/**
 * What the global directory needs to know about a room: head count for the
 * "x online" number, and enough to list it as an open room. Nothing secret.
 */
export function roomSummary(state) {
  const host = state.players.find((p) => p.id === hostId(state));
  return {
    code: state.code,
    kind: state.isPublic ? "quick" : "private",
    listed: !!state.listed,
    wordLength: state.wordLength,
    online: connectedPlayers(state).length,
    maxPlayers: roomSize(state),
    phase: state.phase,
    deadline: state.phase === "waiting" ? state.deadline : null,
    host: state.isPublic ? null : host?.name ?? null,
    // Lets the directory skip people it also sees browsing the page; never sent to clients
    presence: connectedPlayers(state).map((p) => p.presence).filter(Boolean),
  };
}

const VISITOR_TTL_MS = 30_000; // the multiplayer page polls every 10 s
const ROOM_TTL_MS = 3 * 60 * 60_000; // forget rooms that stopped reporting

/** Can someone from the list still walk into this room? */
export const isOpenRoom = (room) =>
  room.listed &&
  room.online > 0 &&
  room.online < room.maxPlayers &&
  (room.phase === "lobby" || room.phase === "waiting");

/**
 * Snapshot for the multiplayer page: players in rooms + people browsing the
 * page, and the open rooms (soonest start first, then fullest).
 */
export function lobbySnapshot(rooms, visitors, now) {
  const fresh = rooms.filter((r) => now - r.updatedAt < ROOM_TTL_MS);
  const inRooms = fresh.reduce((sum, r) => sum + r.online, 0);
  // Someone who just went from the page into a room is still a recent visitor: count them once
  const inRoom = new Set(fresh.flatMap((r) => r.presence ?? []));
  const browsing = [...visitors].filter(([id, seen]) => now - seen < VISITOR_TTL_MS && !inRoom.has(id)).length;
  const open = fresh
    .filter(isOpenRoom)
    .sort((a, b) => (a.deadline ?? Infinity) - (b.deadline ?? Infinity) || b.online - a.online)
    .slice(0, 12)
    .map(({ code, kind, host, wordLength, online, maxPlayers, phase, deadline }) => ({
      code,
      kind,
      host,
      wordLength,
      online,
      maxPlayers,
      phase,
      deadline,
    }));
  return {
    now,
    online: inRooms + browsing,
    playing: fresh.filter((r) => r.phase === "playing").reduce((sum, r) => sum + r.online, 0),
    rooms: open,
  };
}

export const pruneVisitors = (visitors, now) => {
  for (const [id, seen] of visitors) if (now - seen >= VISITOR_TTL_MS) visitors.delete(id);
};

export const isStaleRoom = (room, now) => now - room.updatedAt >= ROOM_TTL_MS;

// ─── High scores ────────────────────────────────────────────────────────────

/**
 * Leaderboard points for the round that just finished: one point for every
 * opponent you beat (so winning against four people is worth more than
 * against one; not solving it is worth nothing). Returns null when the round
 * shouldn't count: fewer than two people actually played.
 */
export function roundScores(state) {
  if (state.phase !== "finished" || !state.results) return null;
  const active = state.players.filter((p) => p.playing);
  if (active.filter((p) => p.guesses.length > 0).length < MIN_PLAYERS) return null;

  const byId = Object.fromEntries(active.map((p) => [p.id, p]));
  const ranking = state.results.ranking.map((id) => byId[id]).filter(Boolean);
  return ranking.map((p, i) => {
    const solved = p.solvedMs !== null;
    return {
      token: p.token,
      name: p.name,
      points: solved ? ranking.length - 1 - i : 0,
      won: state.results.winnerId === p.id,
      solved,
      solvedMs: p.solvedMs,
    };
  });
}

/** Points you'd get for this round, from what the client can see (same rule as above). */
export function pointsFor(ranking, playerId) {
  const i = ranking.findIndex((p) => p.id === playerId);
  if (i === -1 || !ranking[i].solved) return 0;
  return ranking.length - 1 - i;
}

/** ISO week in Belgian/Dutch time, e.g. "2026-W46". Weeks start on Monday. */
export function weekKey(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  const day = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day));
  const weekday = day.getUTCDay() || 7; // Monday = 1 … Sunday = 7
  day.setUTCDate(day.getUTCDate() + 4 - weekday); // Thursday decides the ISO year
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((day - yearStart) / 86_400_000 + 1) / 7);
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
