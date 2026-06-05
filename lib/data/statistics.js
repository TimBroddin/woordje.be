import { unstable_cache } from "next/cache";
import getTurso from "@/lib/turso";

async function getStatisticsUncached(gameId, wordLength, gameType) {
  const turso = getTurso();

  const statsResult = await turso.execute({
    sql: "SELECT wins, total FROM stats WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  });

  const statsRow = statsResult.rows[0];
  const wins = statsRow
    ? Math.round((statsRow.wins / statsRow.total) * 100)
    : 0;
  const total = statsRow ? statsRow.total : 0;

  const distributionResult = await turso.execute({
    sql: "SELECT tries, amount FROM StatsDistribution WHERE gameId = ? AND wordLength = ? AND gameType = ?",
    args: [gameId, wordLength, gameType],
  });

  const distribution = distributionResult.rows.map((row) => ({
    tries: row.tries,
    amount: total ? Math.round((row.amount / total) * 100) : 0,
  }));

  return { wins, distribution };
}

// Revalidate every hour to match the /speel/[gameType] page's revalidate
// window. Next.js uses the MINIMUM of the page revalidate and any inner
// unstable_cache revalidate, so a shorter window here would silently force the
// ISR pages to regenerate (and re-write to cache) far more often than intended.
// Players who finish a game receive live stats from the logResult action's
// return value, so this only governs how stale the SSR'd stats may be for a
// cold first-load visitor — an hour is plenty fresh for a stats display.
export const getStatistics = unstable_cache(
  getStatisticsUncached,
  ["statistics"],
  { revalidate: 3600, tags: ["statistics"] }
);
