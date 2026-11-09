import { DurableObject } from "cloudflare:workers";
import {
  createRoomState,
  join,
  disconnect,
  leave,
  requestStart,
  setWordLength,
  setRoomSize,
  setListed,
  roomSummary,
  roundScores,
  rename,
  guess,
  tick,
  nextWakeup,
  viewFor,
  isJoinable,
} from "./game.js";
import { dict } from "./words.js";
import { randomCode, hashToken, TOKEN_PATTERN } from "./codes.js";
import { directoryStub } from "./directory.js";

const IDLE_MS = 30 * 60_000; // forget rooms nobody touched for this long
const MAX_MESSAGE_BYTES = 2_000;
const OPEN = 1;

/** Create a fresh room under a random unused code. */
export async function createRoom(env, { isPublic, wordLength, maxPlayers, listed }) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    if (await roomStub(env, code).init({ code, isPublic, wordLength, maxPlayers, listed })) return code;
  }
  throw new Error("could_not_create_room");
}

export const roomStub = (env, code) => env.ROOM.get(env.ROOM.idFromName(code));

/**
 * One Durable Object per room. It is the single source of truth: it holds the
 * secret word, scores every guess and pushes a personalised view of the state
 * to each connected socket. Uses the WebSocket Hibernation API, so an idle
 * room costs nothing; state lives in storage and is reloaded on wake.
 */
export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.state = null;
    ctx.blockConcurrencyWhile(async () => {
      this.state = (await ctx.storage.get("state")) ?? null;
    });
    // Keepalive pings are answered without waking the object up
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  // ---- RPC (called by the Worker and the Matchmaker) ----

  async init({ code, isPublic, wordLength, maxPlayers, listed }) {
    if (this.state) return false; // code already taken
    this.state = createRoomState({ code, isPublic, wordLength, maxPlayers, listed, now: Date.now() });
    await this.commit();
    return true;
  }

  async joinable() {
    return !!this.state && isJoinable(this.state, Date.now());
  }

  // ---- WebSocket upgrade ----

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const url = new URL(request.url);
    const token = url.searchParams.get("token") ?? "";
    const name = url.searchParams.get("name") ?? "";
    const presence = url.searchParams.get("p");

    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);

    // Errors during the handshake are invisible to browsers, so accept the
    // socket and explain why we're closing it instead.
    const reject = (code) => {
      server.send(JSON.stringify({ type: "error", code, fatal: true }));
      server.close(4000, code);
      return new Response(null, { status: 101, webSocket: client });
    };

    if (!this.state) return reject("not_found");
    if (!TOKEN_PATTERN.test(token)) return reject("bad_token");

    const result = join(this.state, {
      token,
      name,
      presence: /^[a-f0-9]{16,64}$/.test(presence ?? "") ? presence : null,
    }, Date.now());
    if (result.error) return reject(result.error);

    server.serializeAttachment({ id: result.player.id });
    await this.commit();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    if (!this.state || typeof raw !== "string" || raw.length > MAX_MESSAGE_BYTES) return;
    const { id } = ws.deserializeAttachment() ?? {};
    if (!id) return;

    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    const now = Date.now();
    let result;
    switch (msg.type) {
      case "guess":
        result = guess(this.state, id, msg.word, now, dict);
        break;
      case "start":
        result = requestStart(this.state, id, now);
        break;
      case "wordLength":
        result = setWordLength(this.state, id, msg.wordLength);
        break;
      case "maxPlayers":
        result = setRoomSize(this.state, id, msg.maxPlayers, now);
        break;
      case "listed":
        result = setListed(this.state, id, msg.listed);
        break;
      case "rename":
        result = rename(this.state, id, msg.name);
        break;
      case "leave":
        leave(this.state, id, now);
        ws.serializeAttachment({});
        ws.close(1000, "left");
        result = {};
        break;
      default:
        return;
    }

    if (result.error) {
      ws.send(JSON.stringify({ type: "error", code: result.error, ref: msg.ref }));
      return;
    }
    await this.commit();
    // Ack after the broadcast so the new row is on screen before the input clears
    if (msg.type === "guess") ws.send(JSON.stringify({ type: "guessed", ref: msg.ref }));
  }

  async webSocketClose(ws, code) {
    await this.dropSocket(ws);
    try {
      ws.close(code === 1005 ? 1000 : code, "bye");
    } catch {
      // already closed
    }
  }

  async webSocketError(ws) {
    await this.dropSocket(ws);
  }

  async dropSocket(ws) {
    if (!this.state) return;
    const { id } = ws.deserializeAttachment() ?? {};
    if (!id) return;
    // The same player may still be connected from another tab
    const stillHere = this.openSockets().some(
      (s) => s !== ws && s.deserializeAttachment()?.id === id
    );
    if (!stillHere) {
      disconnect(this.state, id, Date.now());
      await this.commit();
    }
  }

  // ---- Timers ----

  async alarm() {
    if (!this.state) return;
    const now = Date.now();
    if (this.openSockets().length === 0 && now - this.state.lastActivity >= IDLE_MS) {
      const code = this.state.code;
      await this.ctx.storage.deleteAll();
      this.state = null;
      await this.report(code, null);
      return;
    }
    await this.commit();
  }

  // ---- Helpers ----

  openSockets() {
    return this.ctx.getWebSockets().filter((ws) => ws.readyState === OPEN);
  }

  /** Apply due timers, persist, push state to everyone, schedule the next wake. */
  async commit() {
    const now = Date.now();
    tick(this.state, now, dict);
    const scores = this.takeScores();
    await this.ctx.storage.put("state", this.state);

    for (const ws of this.openSockets()) {
      const { id } = ws.deserializeAttachment() ?? {};
      if (!id) continue;
      try {
        ws.send(JSON.stringify(viewFor(this.state, id, now)));
      } catch {
        // socket went away mid-broadcast; its close handler will clean up
      }
    }

    // Always keep an alarm pending so abandoned rooms eventually get cleaned up
    await this.ctx.storage.setAlarm(nextWakeup(this.state) ?? now + IDLE_MS);

    await this.report(this.state.code, roomSummary(this.state));
    if (scores) await this.recordScores(scores);
  }

  /** Each finished round is scored exactly once (marked in state, which is persisted next). */
  takeScores() {
    const state = this.state;
    if (state.phase !== "finished" || state.scoredRound === state.round) return null;
    state.scoredRound = state.round;
    return roundScores(state);
  }

  async recordScores(scores) {
    try {
      const players = await Promise.all(
        scores.map(async ({ token, ...rest }) => ({ ...rest, player: await hashToken(token) }))
      );
      await directoryStub(this.env).recordRound(players);
    } catch (err) {
      console.error("recording scores failed", err);
    }
  }

  /** Tell the directory about head count / phase changes (only when they change). */
  async report(code, summary) {
    const key = JSON.stringify(summary);
    if (key === this.lastReport) return;
    try {
      await directoryStub(this.env).report(code, summary);
      this.lastReport = key;
    } catch (err) {
      // The game must not suffer if the directory is unavailable
      console.error("directory report failed", err);
    }
  }
}
