import { DurableObject } from "cloudflare:workers";
import { lobbySnapshot, pruneVisitors, isStaleRoom, weekKey } from "./game.js";

const TOP = 10;

/**
 * One global object that knows, roughly, what's going on: rooms report a
 * short summary when their head count or phase changes, and the multiplayer
 * page polls a snapshot (players online + open rooms) every few seconds.
 * It also keeps the high scores (SQLite), per week and all time.
 */
export class Directory extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.rooms = new Map(); // code → summary (+ updatedAt), mirrored in storage
    this.visitors = new Map(); // presence id → last seen, memory only
    ctx.blockConcurrencyWhile(async () => {
      const stored = await ctx.storage.list({ prefix: "room:" });
      for (const room of stored.values()) this.rooms.set(room.code, room);
      ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS scores (
          period TEXT NOT NULL,      -- 'all' or an ISO week like '2026-W46'
          player TEXT NOT NULL,      -- hash of the player's secret token
          name TEXT NOT NULL,        -- latest display name
          points INTEGER NOT NULL DEFAULT 0,
          wins INTEGER NOT NULL DEFAULT 0,
          played INTEGER NOT NULL DEFAULT 0,
          solved INTEGER NOT NULL DEFAULT 0,
          best_ms INTEGER,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (period, player)
        );
        CREATE INDEX IF NOT EXISTS scores_rank ON scores (period, points DESC, wins DESC);
      `);
    });
  }

  /** Called by a Room. `summary` null means the room is gone. */
  async report(code, summary) {
    if (!summary) {
      this.rooms.delete(code);
      await this.ctx.storage.delete(`room:${code}`);
      return;
    }
    const room = { ...summary, updatedAt: Date.now() };
    this.rooms.set(code, room);
    await this.ctx.storage.put(`room:${code}`, room);
  }

  /** Called by a Room when a round that counts is over. Players are already hashed. */
  async recordRound(players) {
    const now = Date.now();
    for (const period of ["all", weekKey(new Date(now))]) {
      for (const p of players) {
        this.ctx.storage.sql.exec(
          `INSERT INTO scores (period, player, name, points, wins, played, solved, best_ms, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
           ON CONFLICT (period, player) DO UPDATE SET
             name = excluded.name,
             points = points + excluded.points,
             wins = wins + excluded.wins,
             played = played + 1,
             solved = solved + excluded.solved,
             best_ms = CASE
               WHEN excluded.best_ms IS NOT NULL AND (best_ms IS NULL OR excluded.best_ms < best_ms)
               THEN excluded.best_ms ELSE best_ms END,
             updated_at = excluded.updated_at`,
          period,
          p.player,
          p.name,
          p.points,
          p.won ? 1 : 0,
          p.solved ? 1 : 0,
          p.solvedMs,
          now
        );
      }
    }
  }

  /** Top 10 per period, plus where `player` (a hash, optional) stands. */
  leaderboard(player) {
    const result = {};
    for (const [key, period] of [["week", weekKey()], ["all", "all"]]) {
      const top = this.ctx.storage.sql
        .exec(
          `SELECT player, name, points, wins, played, best_ms FROM scores
           WHERE period = ? ORDER BY points DESC, wins DESC, played ASC LIMIT ?`,
          period,
          TOP
        )
        .toArray();
      const rows = top.map((row, i) => toRow(row, i + 1, row.player === player));

      let you = null;
      if (player && !rows.some((r) => r.you)) {
        const mine = this.ctx.storage.sql
          .exec(`SELECT player, name, points, wins, played, best_ms FROM scores WHERE period = ? AND player = ?`, period, player)
          .toArray()[0];
        if (mine) {
          const { ahead } = this.ctx.storage.sql
            .exec(
              `SELECT COUNT(*) AS ahead FROM scores WHERE period = ? AND
               (points > ? OR (points = ? AND (wins > ? OR (wins = ? AND played < ?))))`,
              period, mine.points, mine.points, mine.wins, mine.wins, mine.played
            )
            .one();
          you = toRow(mine, ahead + 1, true);
        }
      }
      result[key] = { period, rows, you };
    }
    return result;
  }

  /** Called by the multiplayer page via the Worker. */
  async snapshot(visitorId) {
    const now = Date.now();
    if (visitorId) this.visitors.set(visitorId, now);
    pruneVisitors(this.visitors, now);

    const stale = [...this.rooms.values()].filter((room) => isStaleRoom(room, now));
    for (const room of stale) this.rooms.delete(room.code);
    if (stale.length) await this.ctx.storage.delete(stale.map((room) => `room:${room.code}`));

    return lobbySnapshot([...this.rooms.values()], this.visitors, now);
  }
}

export const directoryStub = (env) => env.DIRECTORY.get(env.DIRECTORY.idFromName("global"));

// Never hand out the player hash: the client only needs to know which row is theirs
const toRow = (row, rank, you) => ({
  rank,
  name: row.name,
  points: row.points,
  wins: row.wins,
  played: row.played,
  bestMs: row.best_ms,
  you,
});
