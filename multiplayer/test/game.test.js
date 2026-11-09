import { describe, test, expect } from "bun:test";
import {
  createRoomState,
  join,
  disconnect,
  leave,
  requestStart,
  setWordLength,
  guess,
  tick,
  nextWakeup,
  viewFor,
  isJoinable,
  hostId,
  MAX_PLAYERS,
  QUICK_WAIT_MS,
  FULL_WAIT_MS,
  JOIN_GRACE_MS,
  roundScores,
  pointsFor,
  weekKey,
  setListed,
  roomSummary,
  lobbySnapshot,
  isOpenRoom,
  PRIVATE_COUNTDOWN_MS,
  HURRY_MS,
  DISCONNECT_GRACE_MS,
  ROUND_MS,
} from "../src/game.js";
import { scoreGuess } from "../../lib/score.js";
import { pickWord, dailyWords } from "../src/words.js";

const dict = {
  word: "kaas",
  isValid: (_len, text) => ["kaas", "kast", "taas", "bier", "boom"].includes(text),
  random(_len, recent) {
    this.lastRecent = recent;
    return this.word;
  },
};

const scores = (match) => match.map((l) => l.score).join(",");

function privateRoom(players = ["Ann", "Bob"], now = 0) {
  const state = createRoomState({ code: "KABOM", isPublic: false, wordLength: 4, now });
  const ids = players.map((name, i) => join(state, { token: `t${i}`, name }, now).player.id);
  return { state, ids };
}

function startedRoom(players = ["Ann", "Bob"]) {
  const { state, ids } = privateRoom(players);
  expect(requestStart(state, ids[0], 0)).toEqual({});
  tick(state, PRIVATE_COUNTDOWN_MS, dict);
  expect(state.phase).toBe("playing");
  return { state, ids, t0: PRIVATE_COUNTDOWN_MS };
}

describe("scoreGuess", () => {
  test("marks exact, misplaced and missing letters", () => {
    expect(scores(scoreGuess("kaas", "kast"))).toBe("good,good,off,bad");
    expect(scores(scoreGuess("kaas", "taas"))).toBe("bad,good,good,good");
    expect(scores(scoreGuess("kaas", "saak"))).toBe("off,good,good,off");
  });

  test("does not over-count repeated letters", () => {
    // only one 'e' left after the green one
    expect(scores(scoreGuess("beer", "eeee"))).toBe("bad,good,good,bad");
    expect(scores(scoreGuess("abcd", "aaaa"))).toBe("good,bad,bad,bad");
  });
});

describe("joining", () => {
  test("first connected player is host, reconnect keeps identity", () => {
    const { state, ids } = privateRoom();
    expect(hostId(state)).toBe(ids[0]);

    disconnect(state, ids[0], 10);
    expect(hostId(state)).toBe(ids[1]);

    const again = join(state, { token: "t0", name: "Ann" }, 20).player;
    expect(again.id).toBe(ids[0]);
    expect(hostId(state)).toBe(ids[0]);
    expect(state.players).toHaveLength(2);
  });

  test("rooms are capped, offline players make way", () => {
    const names = Array.from({ length: MAX_PLAYERS }, (_, i) => `P${i}`);
    const { state, ids } = privateRoom(names);
    expect(join(state, { token: "late", name: "Late" }, 0).error).toBe("full");

    disconnect(state, ids[3], 1);
    expect(join(state, { token: "late", name: "Late" }, 2).player).toBeTruthy();
    expect(state.players).toHaveLength(MAX_PLAYERS);
  });

  test("names are cleaned up", () => {
    const { state } = privateRoom([]);
    const p = join(state, { token: "x", name: "  <b>Héél   lange naam die niet past" }, 0).player;
    expect(p.name).toBe("bHéél lange naam");
    const anon = join(state, { token: "y", name: "   " }, 0).player;
    expect(anon.name).toBe("Speler 2");
  });
});

describe("private rooms", () => {
  test("only the host can start, and needs company", () => {
    const { state, ids } = privateRoom(["Ann"]);
    expect(requestStart(state, ids[0], 0).error).toBe("not_enough_players");
    const bob = join(state, { token: "b", name: "Bob" }, 0).player;
    expect(requestStart(state, bob.id, 0).error).toBe("not_host");
    expect(requestStart(state, ids[0], 0)).toEqual({});
    expect(state.phase).toBe("countdown");
    expect(nextWakeup(state)).toBe(PRIVATE_COUNTDOWN_MS);
  });

  test("host can change the word length in the lobby only", () => {
    const { state, ids } = privateRoom();
    expect(setWordLength(state, ids[0], 7)).toEqual({});
    expect(state.wordLength).toBe(7);
    expect(setWordLength(state, ids[0], 42)).toEqual({});
    expect(state.wordLength).toBe(10);
    expect(setWordLength(state, ids[1], 5).error).toBe("not_host");
  });

  test("players who join mid-round spectate until the next one", () => {
    const { state, t0 } = startedRoom();
    const carl = join(state, { token: "c", name: "Carl" }, t0 + 1).player;
    expect(carl.playing).toBe(false);
    expect(guess(state, carl.id, "kaas", t0 + 2, dict).error).toBe("spectating");
  });
});

describe("a round", () => {
  test("validates guesses", () => {
    const { state, ids, t0 } = startedRoom();
    expect(guess(state, ids[0], "kaa", t0, dict).error).toBe("wrong_length");
    expect(guess(state, ids[0], "zzzz", t0, dict).error).toBe("unknown_word");
    expect(guess(state, ids[0], "ka5s", t0, dict).error).toBe("unknown_word");
    expect(scores(guess(state, ids[0], "KAST", t0, dict).match)).toBe("good,good,off,bad");
  });

  test("fewest guesses wins, time breaks ties, wins are tallied", () => {
    const { state, ids, t0 } = startedRoom(["Ann", "Bob", "Cas"]);
    const [ann, bob, cas] = ids;

    guess(state, ann, "kast", t0 + 1000, dict);
    guess(state, ann, "kaas", t0 + 2000, dict); // 2 guesses, solved first
    expect(state.deadline).toBe(t0 + 2000 + HURRY_MS);

    guess(state, bob, "kaas", t0 + 5000, dict); // 1 guess, slower
    expect(state.phase).toBe("playing");

    for (const w of ["kast", "taas", "bier", "boom", "kast"]) guess(state, cas, w, t0 + 6000, dict);
    expect(state.phase).toBe("finished");
    expect(state.results.ranking).toEqual([bob, ann, cas]);
    expect(state.results.winnerId).toBe(bob);
    expect(state.players.find((p) => p.id === bob).wins).toBe(1);
  });

  test("no winner when nobody solves it", () => {
    const { state, t0 } = startedRoom();
    tick(state, t0 + ROUND_MS, dict);
    expect(state.phase).toBe("finished");
    expect(state.results.winnerId).toBe(null);
  });

  test("hurry timer ends the round for slow players", () => {
    const { state, ids, t0 } = startedRoom();
    guess(state, ids[0], "kaas", t0 + 1000, dict);
    tick(state, t0 + 1000 + HURRY_MS - 1, dict);
    expect(state.phase).toBe("playing");
    tick(state, t0 + 1000 + HURRY_MS, dict);
    expect(state.phase).toBe("finished");
  });

  test("disconnected players forfeit after a grace period, reconnecting in time is fine", () => {
    const { state, ids, t0 } = startedRoom(["Ann", "Bob", "Cas"]);
    const [ann, bob, cas] = ids;
    guess(state, ann, "kast", t0, dict);

    disconnect(state, bob, t0 + 100);
    disconnect(state, cas, t0 + 100);
    expect(nextWakeup(state)).toBe(t0 + 100 + DISCONNECT_GRACE_MS);

    join(state, { token: "t2", name: "Cas" }, t0 + 5000); // Cas is back
    tick(state, t0 + 100 + DISCONNECT_GRACE_MS, dict);
    const bobState = state.players.find((p) => p.id === bob);
    expect(bobState.forfeit).toBe(true);
    expect(state.players.find((p) => p.id === cas).forfeit).toBe(false);
    expect(state.players.find((p) => p.id === ann).guesses).toHaveLength(1);
  });

  test("leaving mid-round forfeits and can end the round", () => {
    const { state, ids, t0 } = startedRoom();
    guess(state, ids[0], "kaas", t0, dict);
    leave(state, ids[1], t0 + 10);
    expect(state.phase).toBe("finished");
    expect(state.results.winnerId).toBe(ids[0]);
  });

  test("view hides opponents' letters and the word until the end", () => {
    const { state, ids, t0 } = startedRoom();
    guess(state, ids[0], "kast", t0, dict);

    const bobView = viewFor(state, ids[1], t0);
    expect(bobView.word).toBe(null);
    expect(JSON.stringify(bobView)).not.toContain("kaas");
    expect(JSON.stringify(bobView)).not.toContain("token");
    expect(bobView.players[0].guesses[0][0]).toEqual({ score: "good" });

    const annView = viewFor(state, ids[0], t0);
    expect(annView.players[0].guesses[0][0]).toEqual({ letter: "k", score: "good" });

    guess(state, ids[0], "kaas", t0, dict);
    leave(state, ids[1], t0);
    const end = viewFor(state, ids[1], t0);
    expect(end.word).toBe("kaas");
    expect(end.players[0].guesses[0][0].letter).toBe("k");
  });
});

describe("quick match", () => {
  const publicRoom = () => createRoomState({ code: "QUICK", isPublic: true, wordLength: 5, now: 0 });

  test("starts a countdown once two players are in, cancels if one leaves", () => {
    const state = publicRoom();
    const a = join(state, { token: "a" }, 0).player;
    expect(state.phase).toBe("lobby");
    expect(isJoinable(state, 0)).toBe(true);

    const b = join(state, { token: "b" }, 1000).player;
    expect(state.phase).toBe("waiting");
    expect(state.deadline).toBe(1000 + QUICK_WAIT_MS);

    disconnect(state, b.id, 2000);
    expect(state.phase).toBe("lobby");
    expect(state.players).toHaveLength(1); // anonymous lobby forgets who left
    expect(state.players[0].id).toBe(a.id);
  });

  test("a full room starts quickly and stops accepting players", () => {
    const state = publicRoom();
    for (let i = 0; i < MAX_PLAYERS; i++) join(state, { token: `t${i}` }, 0);
    expect(state.deadline).toBe(FULL_WAIT_MS);
    expect(isJoinable(state, 0)).toBe(false);

    tick(state, FULL_WAIT_MS, dict);
    expect(state.phase).toBe("playing");
    expect(isJoinable(state, FULL_WAIT_MS)).toBe(false);
  });

  test("nobody can start or reconfigure a public room manually", () => {
    const state = publicRoom();
    const a = join(state, { token: "a" }, 0).player;
    join(state, { token: "b" }, 0);
    expect(requestStart(state, a.id, 0).error).toBe("not_allowed");
    expect(setWordLength(state, a.id, 7).error).toBe("not_allowed");
  });
});

describe("word choice", () => {
  test("each round passes the room's previous words to the dictionary", () => {
    const { state, ids } = startedRoom();
    expect(dict.lastRecent).toEqual([]);
    expect(state.recentWords).toEqual(["kaas"]);
    guess(state, ids[0], "kaas", PRIVATE_COUNTDOWN_MS + 1, dict);
    guess(state, ids[1], "kaas", PRIVATE_COUNTDOWN_MS + 2, dict); // round 1 over
    expect(state.phase).toBe("finished");
    expect(requestStart(state, ids[0], PRIVATE_COUNTDOWN_MS + 3)).toEqual({});
    tick(state, PRIVATE_COUNTDOWN_MS * 2 + 3, dict);
    expect(state.round).toBe(2);
    expect(dict.lastRecent).toEqual(["kaas"]);
  });

  test("pickWord skips blocked words", () => {
    const list = ["aap", "noot", "mies"];
    const draws = [0, 0.4, 0.9]; // aap, noot, mies
    const rng = () => draws.shift();
    expect(pickWord(list, new Set(["aap", "noot"]), rng)).toBe("mies");
  });

  test("today's and tomorrow's daily word are blocked", () => {
    const list = ["aap", "noot", "mies", "wim"];
    expect(dailyWords(list, 5)).toEqual(["noot", "mies"]);
    for (let i = 0; i < 200; i++) {
      expect(["noot", "mies"]).not.toContain(pickWord(list, new Set(dailyWords(list, 5))));
    }
  });
});

describe("open game timer", () => {
  const publicRoom = () => createRoomState({ code: "QUICK", isPublic: true, wordLength: 4, now: 0 });

  test("waits 15 s for extra players once a second one is in", () => {
    const state = publicRoom();
    join(state, { token: "a" }, 0);
    expect(nextWakeup(state)).toBe(null);
    join(state, { token: "b" }, 1_000);
    expect(state.phase).toBe("waiting");
    expect(state.deadline).toBe(1_000 + QUICK_WAIT_MS);
    expect(QUICK_WAIT_MS).toBe(15_000);
    tick(state, 1_000 + QUICK_WAIT_MS, dict);
    expect(state.phase).toBe("playing");
    expect(state.startTrigger).toBe("timer");
  });

  test("a late joiner still gets a few seconds", () => {
    const state = publicRoom();
    join(state, { token: "a" }, 0);
    join(state, { token: "b" }, 0);
    join(state, { token: "c" }, QUICK_WAIT_MS - 1_000);
    expect(state.deadline).toBe(QUICK_WAIT_MS - 1_000 + JOIN_GRACE_MS);
  });
});

describe("rooms with friends", () => {
  const room = () => createRoomState({ code: "KABOM", isPublic: false, wordLength: 4, now: 0 });

  test("never start on their own: the host starts", () => {
    const state = room();
    const ann = join(state, { token: "a" }, 0).player;
    join(state, { token: "b" }, 0);
    expect(state.phase).toBe("lobby");
    expect(nextWakeup(state)).toBe(null);
    tick(state, 10 * 60_000, dict);
    expect(state.phase).toBe("lobby");

    expect(requestStart(state, ann.id, 1_000)).toEqual({});
    tick(state, 1_000 + PRIVATE_COUNTDOWN_MS, dict);
    expect(state.phase).toBe("playing");
    expect(state.startTrigger).toBe("host");
  });

  test("take up to 8 players, no size to pick", () => {
    const state = room();
    expect(state.maxPlayers).toBe(MAX_PLAYERS);
    for (let i = 0; i < MAX_PLAYERS; i++) expect(join(state, { token: `t${i}` }, 0).player).toBeTruthy();
    expect(join(state, { token: "late" }, 0).error).toBe("full");
    expect(state.phase).toBe("lobby"); // a full room still waits for the host
  });
});

describe("directory", () => {
  test("records what started a round", () => {
    const full = createRoomState({ code: "BBBBB", isPublic: true, wordLength: 4, now: 0 });
    for (let i = 0; i < MAX_PLAYERS; i++) join(full, { token: `t${i}` }, 0);
    tick(full, FULL_WAIT_MS, dict);
    expect(full.startTrigger).toBe("full");

    const { state } = startedRoom();
    expect(state.startTrigger).toBe("host");
  });

  test("private rooms are unlisted unless the host opens them", () => {
    const state = createRoomState({ code: "KABOM", isPublic: false, wordLength: 5, now: 0 });
    const ann = join(state, { token: "a", name: "Ann", presence: "abcdef0123456789" }, 0).player;
    const bob = join(state, { token: "b", name: "Bob" }, 0).player;
    expect(roomSummary(state)).toMatchObject({
      kind: "private", listed: false, online: 2, host: "Ann", phase: "lobby", presence: ["abcdef0123456789"],
    });
    expect(setListed(state, bob.id, true).error).toBe("not_host");
    expect(setListed(state, ann.id, true)).toEqual({});
    expect(isOpenRoom(roomSummary(state))).toBe(true);
    expect(JSON.stringify(roomSummary(state))).not.toContain("token");
    const view = JSON.stringify(viewFor(state, ann.id, 0));
    expect(view).not.toContain("presence");
  });

  test("snapshot counts players and visitors and lists open rooms, soonest first", () => {
    const now = 1_000_000;
    const room = (code, extra) => ({
      code, kind: "private", listed: true, wordLength: 5, online: 2, maxPlayers: 4,
      phase: "waiting", deadline: now + 20_000, host: "Ann", updatedAt: now, ...extra,
    });
    const rooms = [
      room("LATER", { deadline: now + 25_000 }),
      room("SOONR", { deadline: now + 5_000 }),
      room("NOTYT", { phase: "lobby", deadline: null, online: 1 }),
      room("SECRT", { listed: false }),
      room("FULLL", { online: 4 }),
      room("BUSYY", { phase: "playing", deadline: null, online: 3 }),
      room("EMPTY", { online: 0 }),
      room("STALE", { updatedAt: now - 4 * 60 * 60_000, online: 5 }),
    ];
    rooms[0].presence = ["v3"]; // v3 browsed the page, then joined room LATER
    const visitors = new Map([["v1", now - 5_000], ["v2", now - 60_000], ["v3", now - 2_000]]);
    const snap = lobbySnapshot(rooms, visitors, now);
    expect(snap.rooms.map((r) => r.code)).toEqual(["SOONR", "LATER", "NOTYT"]);
    // 2+2+1+2+4+3+0 in fresh rooms, plus one recent visitor (v3 is already in a room)
    expect(snap.online).toBe(15);
    expect(JSON.stringify(snap)).not.toContain("v3");
    expect(snap.playing).toBe(3);
    expect(snap.rooms[0]).not.toHaveProperty("updatedAt");
  });
});

describe("high scores", () => {
  test("a point for every opponent you beat; nothing if you didn't solve it", () => {
    const { state, ids, t0 } = startedRoom(["Ann", "Bob", "Cas", "Dirk"]);
    const [ann, bob, cas, dirk] = ids;
    guess(state, ann, "kast", t0 + 1000, dict);
    guess(state, ann, "kaas", t0 + 2000, dict); // 2 guesses
    guess(state, bob, "kaas", t0 + 3000, dict); // 1 guess → winner
    guess(state, cas, "kast", t0 + 3000, dict); // tried, never solved
    tick(state, t0 + 3000 + HURRY_MS, dict); // Dirk never typed anything
    expect(state.phase).toBe("finished");

    const scores = Object.fromEntries(roundScores(state).map((s) => [s.name, s]));
    expect(scores.Bob).toMatchObject({ points: 3, won: true, solved: true, token: "t1" });
    expect(scores.Ann).toMatchObject({ points: 2, won: false, solved: true });
    expect(scores.Cas.points).toBe(0);
    expect(scores.Dirk.points).toBe(0);

    const viewRanking = viewFor(state, ann, 0).results.ranking.map((id) =>
      viewFor(state, ann, 0).players.find((p) => p.id === id)
    );
    expect(pointsFor(viewRanking, bob)).toBe(3);
    expect(pointsFor(viewRanking, ann)).toBe(2);
    expect(pointsFor(viewRanking, dirk)).toBe(0);
  });

  test("a round only counts when at least two people actually guessed", () => {
    const { state, ids, t0 } = startedRoom();
    guess(state, ids[0], "kaas", t0, dict);
    tick(state, t0 + HURRY_MS, dict); // Bob idled the whole round
    expect(state.phase).toBe("finished");
    expect(roundScores(state)).toBe(null);
  });

  test("weeks follow Belgian time and start on Monday", () => {
    expect(weekKey(new Date("2026-11-09T12:00:00Z"))).toBe("2026-W46"); // Monday
    expect(weekKey(new Date("2026-11-15T22:30:00Z"))).toBe("2026-W46"); // Sunday 23:30 in Brussels
    expect(weekKey(new Date("2026-11-15T23:30:00Z"))).toBe("2026-W47"); // Monday 00:30 in Brussels
    expect(weekKey(new Date("2027-01-01T12:00:00Z"))).toBe("2026-W53"); // ISO year edge
  });
});
