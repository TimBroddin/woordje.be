"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import getTurso from "@/lib/turso";

// Simple in-memory rate limiter (10 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return null;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return "Rate limit exceeded";
  }

  record.count++;
  return null;
}

export async function logResult(gameId, wordLength, gameType, tries) {
  // Get client IP for rate limiting
  const headersList = await headers();
  const ip = headersList.get("x-real-ip") || headersList.get("x-forwarded-for") || "unknown";

  const rateLimitError = checkRateLimit(ip);
  if (rateLimitError) {
    return { success: false, error: rateLimitError };
  }

  const won = tries <= wordLength + 1;

  try {
    const turso = getTurso();

    // Get existing stats
    const existingStatsResult = await turso.execute({
      sql: "SELECT wins, total FROM stats WHERE gameId = ? AND wordLength = ? AND gameType = ?",
      args: [gameId, wordLength, gameType],
    });

    const existingStats = existingStatsResult.rows[0];

    if (!existingStats) {
      // Insert new row
      await turso.execute({
        sql: "INSERT INTO stats (gameId, wordLength, gameType, wins, total) VALUES (?, ?, ?, ?, ?)",
        args: [gameId, wordLength, gameType, won ? 1 : 0, 1],
      });
    } else {
      // Update existing row
      await turso.execute({
        sql: "UPDATE stats SET wins = ?, total = ? WHERE gameId = ? AND wordLength = ? AND gameType = ?",
        args: [
          existingStats.wins + (won ? 1 : 0),
          existingStats.total + 1,
          gameId,
          wordLength,
          gameType,
        ],
      });
    }

    // Get existing stats distribution
    const existingDistResult = await turso.execute({
      sql: "SELECT amount FROM StatsDistribution WHERE gameId = ? AND wordLength = ? AND gameType = ? AND tries = ?",
      args: [gameId, wordLength, gameType, tries],
    });

    const existingDist = existingDistResult.rows[0];

    if (!existingDist) {
      // Insert new row
      await turso.execute({
        sql: "INSERT INTO StatsDistribution (gameId, wordLength, gameType, tries, amount) VALUES (?, ?, ?, ?, ?)",
        args: [gameId, wordLength, gameType, tries, 1],
      });
    } else {
      // Update existing row
      await turso.execute({
        sql: "UPDATE StatsDistribution SET amount = ? WHERE gameId = ? AND wordLength = ? AND gameType = ? AND tries = ?",
        args: [existingDist.amount + 1, gameId, wordLength, gameType, tries],
      });
    }

    // Invalidate statistics cache
    revalidateTag("statistics");

    // Fetch and return updated statistics to avoid separate getStatistics call
    const updatedStatsResult = await turso.execute({
      sql: "SELECT wins, total FROM stats WHERE gameId = ? AND wordLength = ? AND gameType = ?",
      args: [gameId, wordLength, gameType],
    });

    const updatedStatsRow = updatedStatsResult.rows[0];
    const winsPercent = updatedStatsRow
      ? Math.round((updatedStatsRow.wins / updatedStatsRow.total) * 100)
      : 0;
    const total = updatedStatsRow ? updatedStatsRow.total : 0;

    const distributionResult = await turso.execute({
      sql: "SELECT tries, amount FROM StatsDistribution WHERE gameId = ? AND wordLength = ? AND gameType = ?",
      args: [gameId, wordLength, gameType],
    });

    const distribution = distributionResult.rows.map((row) => ({
      tries: row.tries,
      amount: total ? Math.round((row.amount / total) * 100) : 0,
    }));

    return { success: true, statistics: { wins: winsPercent, distribution } };
  } catch (error) {
    console.error("Error logging result:", error);
    return { success: false, error: "Database error" };
  }
}
